import {
  DT,
  MSG,
  decodePingId,
  decodeRoster,
  decodeSnapshot,
  decodeWelcome,
  encodeInput,
  encodePing,
  encodeRestart,
  messageType,
  step,
  type GameState,
  type PlayerInput,
  type Snapshot,
} from "@fuseball/shared";
import { NET } from "./config";

interface PendingInput {
  seq: number;
  input: PlayerInput;
}

interface TimedSnapshot {
  snapshot: Snapshot;
  recvTime: number;
}

export interface NetDebug {
  snapshots: number;
  maxGapMs: number;
  maxReconcileMs: number;
  bufferLen: number;
  pendingLen: number;
}

export interface NetClient {
  connect(): void;
  disconnect(): void;
  localId(): number | null;
  localStamina(): number; // 0..1 for the local player (predicted)
  ping(): number | null; // smoothed round-trip latency in ms
  tick(input: PlayerInput): void; // fixed rate: send input + advance full-state prediction
  frame(dt: number, now: number): Snapshot | null; // per frame: smooth + build render snapshot
  requestRestart(): void; // ask the server for a rematch after a finished game
  debug(): NetDebug;
}

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

// rebuild a full GameState from a snapshot so the client can run the real sim
const stateFromSnapshot = (s: Snapshot): GameState => ({
  tick: s.tick,
  status: s.status,
  startingTeam: s.startingTeam,
  players: s.players.map((p) => ({
    id: p.id,
    team: p.team,
    x: p.x,
    y: p.y,
    vx: 0,
    vy: 0,
    stamina: p.stamina ?? 1,
  })),
  ball: {
    x: s.ball.x,
    y: s.ball.y,
    z: s.ball.z,
    vx: s.ball.vx,
    vy: s.ball.vy,
    vz: 0,
    lastTouchedBy: null,
  },
  score: [s.score[0], s.score[1]],
  timeRemaining: s.timeRemaining,
  protectedRemaining: s.protectedRemaining,
  celebrationRemaining: s.celebrationRemaining,
  lastScoringTeam: s.lastScoringTeam,
});

// in-place variant used every snapshot so reconcile doesn't allocate a new state
const applySnapshotTo = (state: GameState, s: Snapshot): void => {
  state.tick = s.tick;
  state.status = s.status;
  state.startingTeam = s.startingTeam;
  state.score[0] = s.score[0];
  state.score[1] = s.score[1];
  state.timeRemaining = s.timeRemaining;
  state.protectedRemaining = s.protectedRemaining;
  state.celebrationRemaining = s.celebrationRemaining;
  state.lastScoringTeam = s.lastScoringTeam;

  state.players.length = s.players.length;
  for (let i = 0; i < s.players.length; i++) {
    const sp = s.players[i]!;
    let p = state.players[i];
    if (!p) {
      p = { id: 0, team: 0, x: 0, y: 0, vx: 0, vy: 0, stamina: 1 };
      state.players[i] = p;
    }
    p.id = sp.id;
    p.team = sp.team;
    p.x = sp.x;
    p.y = sp.y;
    p.vx = 0;
    p.vy = 0;
    p.stamina = sp.stamina ?? 1;
  }

  const b = state.ball;
  b.x = s.ball.x;
  b.y = s.ball.y;
  b.z = s.ball.z;
  b.vx = s.ball.vx;
  b.vy = s.ball.vy;
  b.vz = 0;
  b.lastTouchedBy = null;
};

export const createNetClient = (url: string): NetClient => {
  let ws: WebSocket | null = null;
  let myId: number | null = null;
  let seq = 0;

  const pending: PendingInput[] = [];
  const buffer: TimedSnapshot[] = [];
  const roster = new Map<number, { name: string; skin: string }>(); // playerId -> name + emoji skin
  let predicted: GameState | null = null;

  let smoothPing = 0;
  let pingReady = false;
  let pingSeq = 0;
  let pingSentAt = 0;
  let pingPending = -1;
  let lastPingAt = 0;

  // diagnostics (reset each debug() call)
  let diagSnapshots = 0;
  let diagMaxGap = 0;
  let diagMaxReconcile = 0;
  let diagLastSnap = 0;

  let renderTick = 0; // tick-based playback clock for remote interpolation
  let renderTickReady = false;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let closedByUser = false;

  const renderLocal = { x: 0, y: 0 };
  const renderBall = { x: 0, y: 0, z: 0 };
  let smoothingReady = false;
  let possession = 0; // 0=ball on remote (delayed) timeline, 1=on local predicted timeline

  // reused each frame so we don't allocate a new snapshot (+ player objects)
  // every render frame, which caused GC hitches while moving
  const out: Snapshot = {
    tick: 0,
    status: "warmup",
    score: [0, 0],
    timeRemaining: 0,
    celebrationRemaining: 0,
    protectedRemaining: 0,
    lastScoringTeam: null,
    startingTeam: 0,
    ackSeq: 0,
    players: [],
    ball: { x: 0, y: 0, z: 0, vx: 0, vy: 0 },
  };

  // reconcile: rebuild the predicted world from the authoritative snapshot, then
  // replay the inputs the server hasn't acked yet
  const reconcile = (snapshot: Snapshot): void => {
    if (myId === null) return;
    if (predicted) applySnapshotTo(predicted, snapshot);
    else predicted = stateFromSnapshot(snapshot);
    while (pending.length > 0 && pending[0]!.seq <= snapshot.ackSeq)
      pending.shift();
    for (const p of pending) step(predicted, { [myId]: p.input });
  };

  const connect = (): void => {
    ws = new WebSocket(url);
    ws.binaryType = "arraybuffer";
    ws.onmessage = (ev) => {
      const data = ev.data as ArrayBuffer;
      const type = messageType(data);
      if (type === MSG.WELCOME) {
        myId = decodeWelcome(data).playerId;
      } else if (type === MSG.SNAPSHOT) {
        const tRecv = performance.now();
        if (diagLastSnap)
          diagMaxGap = Math.max(diagMaxGap, tRecv - diagLastSnap);
        diagLastSnap = tRecv;
        diagSnapshots += 1;
        const snapshot = decodeSnapshot(data);
        buffer.push({ snapshot, recvTime: tRecv });
        if (buffer.length > NET.maxBuffer) buffer.shift();
        const r0 = performance.now();
        reconcile(snapshot);
        diagMaxReconcile = Math.max(diagMaxReconcile, performance.now() - r0);
      } else if (type === MSG.PONG) {
        if (decodePingId(data) === pingPending) {
          const rtt = performance.now() - pingSentAt;
          smoothPing = pingReady ? smoothPing + (rtt - smoothPing) * 0.4 : rtt;
          pingReady = true;
          pingPending = -1;
        }
      } else if (type === MSG.ROSTER) {
        roster.clear();
        for (const e of decodeRoster(data))
          roster.set(e.id, { name: e.name, skin: e.skin });
      }
    };
    ws.onclose = () => {
      myId = null;
      predicted = null;
      smoothingReady = false;
      possession = 0;
      renderTickReady = false;
      pending.length = 0;
      buffer.length = 0;
      roster.clear();
      pingReady = false;
      pingPending = -1;
      if (!closedByUser) reconnectTimer = setTimeout(connect, NET.reconnectMs);
    };
  };

  const disconnect = (): void => {
    closedByUser = true;
    if (reconnectTimer !== null) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    ws?.close();
    ws = null;
  };

  const tick = (input: PlayerInput): void => {
    if (!ws || ws.readyState !== WebSocket.OPEN || myId === null) return;
    seq += 1;
    ws.send(encodeInput(seq, input));
    pending.push({ seq, input: { ...input } });
    if (pending.length > 180) pending.shift(); // safety: bound replay cost if acks stall
    if (predicted) step(predicted, { [myId]: input });
  };

  const frame = (dt: number, now: number): Snapshot | null => {
    // latency probe: server echoes immediately, so this is pure network RTT
    if (ws && ws.readyState === WebSocket.OPEN && now - lastPingAt > 1000) {
      lastPingAt = now;
      pingSeq = (pingSeq + 1) >>> 0;
      pingPending = pingSeq;
      pingSentAt = now;
      ws.send(encodePing(pingSeq));
    }

    if (buffer.length === 0) return null;
    const latest = buffer[buffer.length - 1]!.snapshot;

    // smooth the predicted local player + ball toward their targets (removes 30Hz
    // choppiness and softens reconciliation corrections)
    if (predicted) {
      const me = predicted.players.find((p) => p.id === myId);
      if (!smoothingReady && me) {
        renderLocal.x = me.x;
        renderLocal.y = me.y;
        renderBall.x = predicted.ball.x;
        renderBall.y = predicted.ball.y;
        renderBall.z = predicted.ball.z;
        smoothingReady = true;
      }
      if (me) {
        const tl = 1 - Math.exp(-dt / NET.smoothTau);
        renderLocal.x += (me.x - renderLocal.x) * tl;
        renderLocal.y += (me.y - renderLocal.y) * tl;
      }
      const tb = 1 - Math.exp(-dt / NET.ballTau);
      renderBall.x += (predicted.ball.x - renderBall.x) * tb;
      renderBall.y += (predicted.ball.y - renderBall.y) * tb;
      renderBall.z += (predicted.ball.z - renderBall.z) * tb;
    }

    // remote players play back on a tick-based clock so their motion stays smooth
    // even when snapshots arrive with irregular timing (timer/network jitter)
    const newestTick = buffer[buffer.length - 1]!.snapshot.tick;
    if (!renderTickReady) {
      renderTick = newestTick - NET.interpTicks;
      renderTickReady = true;
    }
    renderTick += dt / DT; // advance in tick units at real time
    const oldestTick = buffer[0]!.snapshot.tick;
    if (renderTick > newestTick) renderTick = newestTick; // starved: hold at newest
    if (renderTick < oldestTick) renderTick = oldestTick;
    if (newestTick - renderTick > NET.interpTicks + 3) {
      renderTick = newestTick - NET.interpTicks; // fell too far behind: resync
    }

    let older = buffer[0]!;
    let newer = buffer[buffer.length - 1]!;
    for (let i = 0; i < buffer.length - 1; i++) {
      if (
        buffer[i]!.snapshot.tick <= renderTick &&
        buffer[i + 1]!.snapshot.tick >= renderTick
      ) {
        older = buffer[i]!;
        newer = buffer[i + 1]!;
        break;
      }
    }
    const dtick = newer.snapshot.tick - older.snapshot.tick;
    const t =
      dtick > 0
        ? Math.max(0, Math.min(1, (renderTick - older.snapshot.tick) / dtick))
        : 0;

    // write into the reused output snapshot (no per-frame allocation)
    out.tick = latest.tick;
    out.status = latest.status;
    out.score[0] = latest.score[0];
    out.score[1] = latest.score[1];
    out.timeRemaining = latest.timeRemaining;
    out.celebrationRemaining = latest.celebrationRemaining;
    out.protectedRemaining = latest.protectedRemaining;
    out.lastScoringTeam = latest.lastScoringTeam;
    out.startingTeam = latest.startingTeam;
    out.ackSeq = latest.ackSeq;

    if (smoothingReady) {
      // The predicted ball is at "present" time (matches the local player). The
      // buffer-interpolated ball is ~interpTicks in the past (matches remote players).
      // Draw predicted when the local player is controlling it, interpolated otherwise,
      // so a remote player's kick lines up with the remote player instead of jumping ahead.
      const ob = older.snapshot.ball;
      const nb = newer.snapshot.ball;
      const ballIx = lerp(ob.x, nb.x, t);
      const ballIy = lerp(ob.y, nb.y, t);
      const ballIz = lerp(ob.z, nb.z, t);
      const dx = renderLocal.x - renderBall.x;
      const dy = renderLocal.y - renderBall.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      let target =
        (NET.ballControlFar - dist) /
        (NET.ballControlFar - NET.ballControlNear);
      target = target < 0 ? 0 : target > 1 ? 1 : target;
      // rise fast (grab possession the instant we touch), release slowly so our own
      // kick stays on the predicted timeline instead of decelerating as the ball flies off
      const pTau = target > possession ? 0.02 : NET.ballReleaseTau;
      possession += (target - possession) * (1 - Math.exp(-dt / pTau));
      const w = possession;
      out.ball.x = lerp(ballIx, renderBall.x, w);
      out.ball.y = lerp(ballIy, renderBall.y, w);
      out.ball.z = lerp(ballIz, renderBall.z, w);
    } else {
      out.ball.x = latest.ball.x;
      out.ball.y = latest.ball.y;
      out.ball.z = latest.ball.z;
    }

    out.players.length = latest.players.length;
    for (let i = 0; i < latest.players.length; i++) {
      const lp = latest.players[i]!;
      let p = out.players[i];
      if (!p) {
        p = { id: 0, team: 0, x: 0, y: 0 };
        out.players[i] = p;
      }
      p.id = lp.id;
      p.team = lp.team;
      const entry = roster.get(lp.id);
      p.name = entry?.name;
      p.skin = entry?.skin;
      if (lp.id === myId && smoothingReady) {
        p.x = renderLocal.x;
        p.y = renderLocal.y;
      } else {
        const op = older.snapshot.players.find((q) => q.id === lp.id);
        const np = newer.snapshot.players.find((q) => q.id === lp.id);
        if (op && np) {
          p.x = lerp(op.x, np.x, t);
          p.y = lerp(op.y, np.y, t);
        } else {
          p.x = lp.x;
          p.y = lp.y;
        }
      }
    }

    return out;
  };

  return {
    connect,
    disconnect,
    localId: () => myId,
    localStamina: () => {
      if (myId === null || !predicted) return 1;
      return predicted.players.find((p) => p.id === myId)?.stamina ?? 1;
    },
    ping: () => (pingReady ? Math.round(smoothPing) : null),
    tick,
    frame,
    requestRestart: () => {
      if (ws && ws.readyState === WebSocket.OPEN) ws.send(encodeRestart());
    },
    debug: () => {
      const d: NetDebug = {
        snapshots: diagSnapshots,
        maxGapMs: diagMaxGap,
        maxReconcileMs: diagMaxReconcile,
        bufferLen: buffer.length,
        pendingLen: pending.length,
      };
      diagSnapshots = 0;
      diagMaxGap = 0;
      diagMaxReconcile = 0;
      return d;
    },
  };
};
