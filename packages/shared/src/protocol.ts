import type { GameState, PlayerInput, RoundStatus, Team } from "./types";

// Compact binary wire protocol (little-endian DataView). One message type byte first.
export const MSG = {
  WELCOME: 1,
  INPUT: 2,
  SNAPSHOT: 3,
  ROSTER: 4,
  PING: 5,
  PONG: 6,
  RESTART: 7,
} as const;

const IN_UP = 1;
const IN_DOWN = 2;
const IN_LEFT = 4;
const IN_RIGHT = 8;
const IN_KICK = 16;
const IN_SPRINT = 32;

const STATUS_CODES: RoundStatus[] = [
  "warmup",
  "protected",
  "live",
  "celebrating",
  "finished",
];

const POS_SCALE = 8; // fixed-point scale for positions (1/8 px precision)
const VEL_SCALE = 32; // fixed-point scale for ball velocity

const toView = (data: ArrayBuffer | Uint8Array): DataView =>
  data instanceof Uint8Array
    ? new DataView(data.buffer, data.byteOffset, data.byteLength)
    : new DataView(data);

export const messageType = (data: ArrayBuffer | Uint8Array): number =>
  toView(data).getUint8(0);

export const encodeInputBits = (input: PlayerInput): number =>
  (input.up ? IN_UP : 0) |
  (input.down ? IN_DOWN : 0) |
  (input.left ? IN_LEFT : 0) |
  (input.right ? IN_RIGHT : 0) |
  (input.kick ? IN_KICK : 0) |
  (input.sprint ? IN_SPRINT : 0);

export const decodeInputBits = (bits: number): PlayerInput => ({
  up: (bits & IN_UP) !== 0,
  down: (bits & IN_DOWN) !== 0,
  left: (bits & IN_LEFT) !== 0,
  right: (bits & IN_RIGHT) !== 0,
  kick: (bits & IN_KICK) !== 0,
  sprint: (bits & IN_SPRINT) !== 0,
});

// --- client -> server: input ---
export const encodeInput = (seq: number, input: PlayerInput): ArrayBuffer => {
  const buf = new ArrayBuffer(6);
  const v = new DataView(buf);
  v.setUint8(0, MSG.INPUT);
  v.setUint8(1, encodeInputBits(input));
  v.setUint32(2, seq >>> 0);
  return buf;
};

export interface DecodedInput {
  seq: number;
  input: PlayerInput;
}

export const decodeInput = (data: ArrayBuffer | Uint8Array): DecodedInput => {
  const v = toView(data);
  return { input: decodeInputBits(v.getUint8(1)), seq: v.getUint32(2) };
};

// --- latency probe: client sends PING, server echoes the same id back at once ---
export const encodePing = (id: number): ArrayBuffer => {
  const buf = new ArrayBuffer(5);
  const v = new DataView(buf);
  v.setUint8(0, MSG.PING);
  v.setUint32(1, id >>> 0);
  return buf;
};

export const encodePong = (id: number): ArrayBuffer => {
  const buf = new ArrayBuffer(5);
  const v = new DataView(buf);
  v.setUint8(0, MSG.PONG);
  v.setUint32(1, id >>> 0);
  return buf;
};

export const decodePingId = (data: ArrayBuffer | Uint8Array): number =>
  toView(data).getUint32(1);

// --- client -> server: request a rematch once the game is finished ---
export const encodeRestart = (): ArrayBuffer => {
  const buf = new ArrayBuffer(1);
  new DataView(buf).setUint8(0, MSG.RESTART);
  return buf;
};

// --- server -> client: welcome ---
export const encodeWelcome = (playerId: number): ArrayBuffer => {
  const buf = new ArrayBuffer(2);
  const v = new DataView(buf);
  v.setUint8(0, MSG.WELCOME);
  v.setUint8(1, playerId);
  return buf;
};

export const decodeWelcome = (
  data: ArrayBuffer | Uint8Array,
): { playerId: number } => ({
  playerId: toView(data).getUint8(1),
});

// --- server -> client: state snapshot ---
export interface SnapshotPlayer {
  id: number;
  team: Team;
  x: number;
  y: number;
  stamina?: number; // 0..1
  name?: string; // filled in client-side from the roster (not sent in every snapshot)
  skin?: string; // emoji slug, filled in client-side from the roster
  goals?: number; // filled in client-side from the roster
}

export interface Snapshot {
  tick: number;
  status: RoundStatus;
  score: [number, number];
  timeRemaining: number;
  celebrationRemaining: number;
  protectedRemaining: number;
  lastScoringTeam: Team | null;
  startingTeam: Team;
  ackSeq: number; // last input seq this client had processed (for reconciliation)
  players: SnapshotPlayer[];
  ball: { x: number; y: number; z: number; vx: number; vy: number };
}

export const encodeSnapshot = (
  state: GameState,
  ackSeq: number,
): ArrayBuffer => {
  const count = state.players.length;
  const size = 21 + count * 7 + 10;
  const buf = new ArrayBuffer(size);
  const v = new DataView(buf);
  let o = 0;
  v.setUint8(o, MSG.SNAPSHOT);
  o += 1;
  v.setUint32(o, state.tick >>> 0);
  o += 4;
  v.setUint8(o, Math.max(0, STATUS_CODES.indexOf(state.status)));
  o += 1;
  v.setUint8(o, state.score[0]);
  o += 1;
  v.setUint8(o, state.score[1]);
  o += 1;
  v.setUint16(o, Math.max(0, Math.round(state.timeRemaining * 100)));
  o += 2;
  v.setUint16(o, Math.max(0, Math.round(state.celebrationRemaining * 100)));
  o += 2;
  v.setUint16(o, Math.max(0, Math.round(state.protectedRemaining * 100)));
  o += 2;
  v.setUint8(o, state.lastScoringTeam === null ? 255 : state.lastScoringTeam);
  o += 1;
  v.setUint8(o, state.startingTeam);
  o += 1;
  v.setUint32(o, ackSeq >>> 0);
  o += 4;
  v.setUint8(o, count);
  o += 1;
  for (const p of state.players) {
    v.setUint8(o, p.id);
    o += 1;
    v.setUint8(o, p.team);
    o += 1;
    v.setInt16(o, Math.round(p.x * POS_SCALE));
    o += 2;
    v.setInt16(o, Math.round(p.y * POS_SCALE));
    o += 2;
    v.setUint8(o, Math.max(0, Math.min(255, Math.round(p.stamina * 255))));
    o += 1;
  }
  v.setInt16(o, Math.round(state.ball.x * POS_SCALE));
  o += 2;
  v.setInt16(o, Math.round(state.ball.y * POS_SCALE));
  o += 2;
  v.setInt16(o, Math.round(state.ball.z * POS_SCALE));
  o += 2;
  v.setInt16(o, Math.round(state.ball.vx * VEL_SCALE));
  o += 2;
  v.setInt16(o, Math.round(state.ball.vy * VEL_SCALE));
  return buf;
};

export const decodeSnapshot = (data: ArrayBuffer | Uint8Array): Snapshot => {
  const v = toView(data);
  let o = 1; // skip message type
  const tick = v.getUint32(o);
  o += 4;
  const status = STATUS_CODES[v.getUint8(o)] ?? "warmup";
  o += 1;
  const scoreA = v.getUint8(o);
  o += 1;
  const scoreB = v.getUint8(o);
  o += 1;
  const timeRemaining = v.getUint16(o) / 100;
  o += 2;
  const celebrationRemaining = v.getUint16(o) / 100;
  o += 2;
  const protectedRemaining = v.getUint16(o) / 100;
  o += 2;
  const lastScorer = v.getUint8(o);
  o += 1;
  const startingTeam = v.getUint8(o) as Team;
  o += 1;
  const ackSeq = v.getUint32(o);
  o += 4;
  const count = v.getUint8(o);
  o += 1;
  const players: SnapshotPlayer[] = [];
  for (let i = 0; i < count; i++) {
    const id = v.getUint8(o);
    o += 1;
    const team = v.getUint8(o) as Team;
    o += 1;
    const x = v.getInt16(o) / POS_SCALE;
    o += 2;
    const y = v.getInt16(o) / POS_SCALE;
    o += 2;
    const stamina = v.getUint8(o) / 255;
    o += 1;
    players.push({ id, team, x, y, stamina });
  }
  const ball = {
    x: v.getInt16(o) / POS_SCALE,
    y: v.getInt16(o + 2) / POS_SCALE,
    z: v.getInt16(o + 4) / POS_SCALE,
    vx: v.getInt16(o + 6) / VEL_SCALE,
    vy: v.getInt16(o + 8) / VEL_SCALE,
  };
  return {
    tick,
    status,
    score: [scoreA, scoreB],
    timeRemaining,
    celebrationRemaining,
    protectedRemaining,
    lastScoringTeam: lastScorer === 255 ? null : (lastScorer as Team),
    startingTeam,
    ackSeq,
    players,
    ball,
  };
};

// --- server -> client: roster (player names) ---
// Sent only when the roster changes (join/leave), so per-tick snapshots stay tiny.
export interface RosterEntry {
  id: number;
  team: Team;
  name: string;
  skin: string; // emoji slug
  goals: number; // goals scored this match
}

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export const encodeRoster = (entries: RosterEntry[]): ArrayBuffer => {
  const names = entries.map((e) => textEncoder.encode(e.name.slice(0, 32)));
  const skins = entries.map((e) => textEncoder.encode(e.skin.slice(0, 48)));
  let size = 2; // type + count
  for (let i = 0; i < entries.length; i++)
    size += 5 + names[i]!.length + skins[i]!.length; // id + team + nameLen + skinLen + goals + bytes
  const buf = new ArrayBuffer(size);
  const v = new DataView(buf);
  const bytes = new Uint8Array(buf);
  let o = 0;
  v.setUint8(o++, MSG.ROSTER);
  v.setUint8(o++, entries.length);
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i]!;
    const n = names[i]!;
    const s = skins[i]!;
    v.setUint8(o++, e.id);
    v.setUint8(o++, e.team);
    v.setUint8(o++, n.length);
    bytes.set(n, o);
    o += n.length;
    v.setUint8(o++, s.length);
    bytes.set(s, o);
    o += s.length;
    v.setUint8(o++, Math.min(255, e.goals));
  }
  return buf;
};

export const decodeRoster = (data: ArrayBuffer | Uint8Array): RosterEntry[] => {
  const v = toView(data);
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  let o = 1;
  const count = v.getUint8(o++);
  const entries: RosterEntry[] = [];
  for (let i = 0; i < count; i++) {
    const id = v.getUint8(o++);
    const team = v.getUint8(o++) as Team;
    const nameLen = v.getUint8(o++);
    const name = textDecoder.decode(bytes.subarray(o, o + nameLen));
    o += nameLen;
    const skinLen = v.getUint8(o++);
    const skin = textDecoder.decode(bytes.subarray(o, o + skinLen));
    o += skinLen;
    const goals = v.getUint8(o++);
    entries.push({ id, team, name, skin, goals });
  }
  return entries;
};
