import { test, expect } from "bun:test";
import {
  createGameState,
  step,
  cloneState,
  PLAYER,
  FIELD,
  type InputMap,
  type RoundStatus,
} from "./index";

const noInput: InputMap = {};

test("player moves at PLAYER.SPEED", () => {
  const state = createGameState(1, 0);
  const start = state.players[0]!.x;
  step(state, { 0: { up: false, down: false, left: false, right: true } });
  expect(state.players[0]!.x).toBeCloseTo(start + PLAYER.SPEED, 6);
  expect(state.players[0]!.vx).toBeCloseTo(PLAYER.SPEED, 6);
});

test("diagonal movement is not faster than orthogonal", () => {
  const state = createGameState(1, 0);
  const start = { x: state.players[0]!.x, y: state.players[0]!.y };
  step(state, { 0: { up: true, down: false, left: false, right: true } });
  const moved = Math.hypot(
    state.players[0]!.x - start.x,
    state.players[0]!.y - start.y,
  );
  expect(moved).toBeCloseTo(PLAYER.SPEED, 6);
});

test("ball loses speed to friction", () => {
  const state = createGameState(1, 0);
  state.ball.vx = 100;
  step(state, noInput);
  expect(state.ball.vx).toBeCloseTo(100 * 0.95, 6);
});

test("simulation is deterministic", () => {
  const a = createGameState(2, 0);
  const b = createGameState(2, 0);
  const pattern = (tick: number): InputMap => ({
    0: { up: tick % 2 === 0, down: false, left: false, right: tick % 3 === 0 },
    1: { up: false, down: tick % 2 === 1, left: tick % 5 === 0, right: false },
  });
  for (let t = 0; t < 300; t++) {
    step(a, pattern(t));
    step(b, pattern(t));
  }
  expect(a).toEqual(b);
});

test("goal starts a non-freezing celebration", () => {
  const state = createGameState(1, 0);
  state.status = "live" as RoundStatus;
  state.ball.x = FIELD.WIDTH - 5;
  state.ball.y = FIELD.HEIGHT / 2;
  state.ball.vx = 50;
  step(state, noInput);
  expect(state.score[0]).toBe(1);
  expect(state.lastScoringTeam).toBe(0);
  expect(state.startingTeam).toBe(1);
  expect(state.status).toBe("celebrating");
  expect(state.celebrationRemaining).toBeGreaterThan(0);
});

test("players still move during a goal celebration", () => {
  const state = createGameState(1, 0);
  state.status = "celebrating" as RoundStatus;
  state.celebrationRemaining = 2;
  const startX = state.players[0]!.x;
  step(state, { 0: { up: false, down: false, left: false, right: true } });
  expect(state.players[0]!.x).toBeGreaterThan(startX);
  expect(state.status).toBe("celebrating");
});

test("the goal box contains the ball instead of letting it fly off the map", () => {
  const state = createGameState(1, 0);
  state.status = "celebrating" as RoundStatus; // ignore scoring, just test containment
  state.celebrationRemaining = 10;
  state.ball.y = FIELD.HEIGHT / 2;
  state.ball.x = FIELD.WIDTH - 20;
  state.ball.vx = 500; // blast it at the right goal
  const maxX = FIELD.WIDTH + FIELD.WIDTH * FIELD.GOAL_ZONE_WIDTH_RATIO;
  for (let i = 0; i < 60; i++) {
    step(state, noInput);
    expect(state.ball.x).toBeLessThanOrEqual(maxX); // never breaches the back wall
  }
  expect(Number.isFinite(state.ball.x)).toBe(true);
});

test("cloneState produces an independent copy", () => {
  const state = createGameState(1, 0);
  const snap = cloneState(state);
  step(state, { 0: { up: false, down: false, left: false, right: true } });
  expect(snap.players[0]!.x).not.toBe(state.players[0]!.x);
});
