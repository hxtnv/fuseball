import { DT, cloneState, createGameState, step } from "@fuseball/shared";
import type { GameState } from "@fuseball/shared";
import {
  GAME,
  FULL,
  POTATO,
  detectInitialQuality,
  type QualitySettings,
} from "./config";
import { createInput } from "./input";
import { render } from "./renderer";

export interface Game {
  start(): void;
  stop(): void;
}

export const createGame = (canvas: HTMLCanvasElement): Game => {
  const ctx = canvas.getContext("2d", { alpha: false })!;
  const input = createInput();

  let quality: QualitySettings = detectInitialQuality();
  let curr: GameState = createGameState(GAME.teamSize, 0);
  let prev: GameState = cloneState(curr);

  let viewport = { w: 1, h: 1, dpr: 1 };
  let raf = 0;
  let last = 0;
  let acc = 0;
  let fps = 60;

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

    acc += Math.min(dt, 0.25); // clamp to avoid the spiral of death after a stall
    const inp = input.get();
    while (acc >= DT) {
      prev = cloneState(curr);
      step(curr, { [GAME.localId]: inp });
      if (curr.status === "finished") {
        curr = createGameState(GAME.teamSize, 0);
        prev = cloneState(curr);
      }
      acc -= DT;
    }

    render(ctx, prev, curr, acc / DT, viewport, quality, GAME.localId, fps);
    raf = requestAnimationFrame(frame);
  };

  return {
    start() {
      resize();
      window.addEventListener("resize", resize);
      window.addEventListener("keydown", onKey);
      input.attach();
      last = 0;
      raf = requestAnimationFrame(frame);
    },
    stop() {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", onKey);
      input.dispose();
    },
  };
};
