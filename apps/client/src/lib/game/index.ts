import { DT } from "@fuseball/shared";
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
}

export const createGame = (canvas: HTMLCanvasElement, wsUrl: string): Game => {
  const ctx = canvas.getContext("2d", { alpha: false })!;
  const input = createInput();
  const net = createNetClient(wsUrl);

  let quality: QualitySettings = detectInitialQuality();
  let viewport = { w: 1, h: 1, dpr: 1 };
  let raf = 0;
  let last = 0;
  let acc = 0;
  let fps = 60;
  let worstFrameMs = 0;
  let frameCount = 0;
  let reportAt = 0;

  const resize = (): void => {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, quality.maxDpr);
    viewport = { w: Math.max(1, rect.width), h: Math.max(1, rect.height), dpr };
    canvas.width = Math.round(viewport.w * dpr);
    canvas.height = Math.round(viewport.h * dpr);
  };

  const onKey = (e: KeyboardEvent): void => {
    if (e.key === "q" || e.key === "Q") {
      quality = quality.name === "full" ? POTATO : FULL;
      resize();
    }
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

    raf = requestAnimationFrame(frame);
  };

  return {
    start() {
      resize();
      window.addEventListener("resize", resize);
      window.addEventListener("keydown", onKey);
      input.attach();
      net.connect();
      last = 0;
      raf = requestAnimationFrame(frame);
    },
    stop() {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", onKey);
      input.dispose();
      net.disconnect();
    },
  };
};
