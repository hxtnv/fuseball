import { DT, type RoundStatus, type Team } from "@fuseball/shared";
import {
  GAME,
  FULL,
  POTATO,
  detectInitialQuality,
  type QualitySettings,
} from "./config";
import { createInput } from "./input";
import { createNetClient } from "./net";
import { render, renderConnecting } from "./renderer";

export interface Game {
  start(): void;
  stop(): void;
  setMoveVector(x: number, y: number): void;
  kick(): void;
  setSprint(down: boolean): void;
  restart(): void;
  toggleQuality(): void;
}

// screen-space state the Preact HUD reads (written each frame from the loop)
export interface HudPlayer {
  id: number;
  team: Team;
  x: number;
  y: number;
  name: string;
}

export interface HudData {
  connected: boolean;
  status: RoundStatus;
  score0: number;
  score1: number;
  timeRemaining: number;
  protectedRemaining: number;
  celebrationRemaining: number;
  lastScoringTeam: Team | null;
  localTeam: Team | null;
  fps: number;
  ping: number | null;
  players: HudPlayer[];
  stamina: number; // 0..1, placeholder until stamina mechanics land
}

export const createGame = (
  canvas: HTMLCanvasElement,
  wsUrl: string,
  onHud?: (hud: HudData) => void,
): Game => {
  const ctx = canvas.getContext("2d", { alpha: false })!;
  const input = createInput();
  const net = createNetClient(wsUrl);

  const hud: HudData = {
    connected: false,
    status: "warmup",
    score0: 0,
    score1: 0,
    timeRemaining: 0,
    protectedRemaining: 0,
    celebrationRemaining: 0,
    lastScoringTeam: null,
    localTeam: null,
    fps: 60,
    ping: null,
    players: [],
    stamina: 1,
  };

  let quality: QualitySettings = detectInitialQuality();
  let viewport = { w: 1, h: 1, dpr: 1 };
  let raf = 0;
  let last = 0;
  let acc = 0;
  let fps = 60;
  let worstFrameMs = 0;
  let frameCount = 0;
  let reportAt = 0;
  let pingAt = 0;
  let playersAt = 0;

  const resize = (): void => {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, quality.maxDpr);
    viewport = { w: Math.max(1, rect.width), h: Math.max(1, rect.height), dpr };
    canvas.width = Math.round(viewport.w * dpr);
    canvas.height = Math.round(viewport.h * dpr);
  };

  const toggleQuality = (): void => {
    quality = quality.name === "full" ? POTATO : FULL;
    resize();
  };

  const frame = (now: number): void => {
    if (!last) last = now;
    const dt = (now - last) / 1000;
    last = now;

    if (dt < GAME.maxFrame) fps += (1 / Math.max(dt, 0.001) - fps) * 0.1;

    // --- diagnostics ---
    const frameMs = dt * 1000;
    if (frameMs > worstFrameMs) worstFrameMs = frameMs;
    frameCount += 1;
    if (frameMs > 60)
      console.warn(`[client] FRAME SPIKE ${frameMs.toFixed(0)}ms`);
    if (!reportAt) reportAt = now + 2000;
    if (now >= reportAt) {
      const d = net.debug();
      const mem = (
        performance as unknown as { memory?: { usedJSHeapSize: number } }
      ).memory;
      const heap = mem
        ? ` heapMB=${(mem.usedJSHeapSize / 1048576).toFixed(1)}`
        : "";
      console.log(
        `[client] fps~${Math.round(frameCount / 2)} worstFrame=${worstFrameMs.toFixed(0)}ms snaps=${d.snapshots} maxSnapGap=${d.maxGapMs.toFixed(0)}ms maxReconcile=${d.maxReconcileMs.toFixed(1)}ms buf=${d.bufferLen} pending=${d.pendingLen}${heap}`,
      );
      worstFrameMs = 0;
      frameCount = 0;
      reportAt = now + 2000;
    }

    // send input + advance prediction at the fixed sim rate
    acc += Math.min(dt, 0.25);
    const inp = input.get();
    while (acc >= DT) {
      net.tick(inp);
      acc -= DT;
    }

    const snapshot = net.frame(dt, now);
    if (snapshot)
      render(ctx, snapshot, viewport, quality, net.localId() ?? -1, fps);
    else renderConnecting(ctx, viewport);

    if (onHud) {
      const me = net.localId();
      hud.connected = !!snapshot;
      if (snapshot) {
        hud.status = snapshot.status;
        hud.score0 = snapshot.score[0];
        hud.score1 = snapshot.score[1];
        hud.timeRemaining = Math.max(0, Math.ceil(snapshot.timeRemaining));
        hud.protectedRemaining = Math.max(
          0,
          Math.ceil(snapshot.protectedRemaining),
        );
        hud.celebrationRemaining = snapshot.celebrationRemaining;
        hud.lastScoringTeam = snapshot.lastScoringTeam;
        hud.localTeam =
          me != null
            ? (snapshot.players.find((p) => p.id === me)?.team ?? null)
            : null;
        // ~12Hz is plenty for the minimap/roster and keeps signal churn low
        if (now >= playersAt) {
          hud.players = snapshot.players.map((p) => ({
            id: p.id,
            team: p.team,
            x: p.x,
            y: p.y,
            name: p.name ?? `P${p.id}`,
          }));
          playersAt = now + 80;
        }
      }
      hud.fps = Math.round(fps);
      hud.stamina = net.localStamina();
      if (now >= pingAt) {
        hud.ping = net.ping();
        pingAt = now + 1000;
      }
      onHud(hud);
    }

    raf = requestAnimationFrame(frame);
  };

  return {
    start() {
      resize();
      window.addEventListener("resize", resize);
      input.attach();
      net.connect();
      last = 0;
      raf = requestAnimationFrame(frame);
    },
    stop() {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      input.dispose();
      net.disconnect();
    },
    setMoveVector(x, y) {
      input.setVector(x, y);
    },
    kick() {
      input.setKick(true);
      // release shortly after so a tap fires a single shot
      setTimeout(() => input.setKick(false), 90);
    },
    setSprint(down) {
      input.setSprint(down);
    },
    restart() {
      net.requestRestart();
    },
    toggleQuality,
  };
};
