import { test, expect } from "bun:test";
import {
  addPlayer,
  cloneState,
  createGameState,
  startMatch,
  step,
  PLAYER,
  FIELD,
  type GameState,
  type InputMap,
  type RoundStatus,
} from "./index";

const noInput: InputMap = {};

const oneVsOne = (): GameState => {
  const state = createGameState(0);
  addPlayer(state, 0); // team 0
  addPlayer(state, 1); // team 1
  startMatch(state);
  return state;
};

test("addPlayer balances teams", () => {
  const state = createGameState(0);
  addPlayer(state, 0);
  addPlayer(state, 1);
  addPlayer(state, 2);
  addPlayer(state, 3);
  const team0 = state.players.filter((p) => p.team === 0).length;
  const team1 = state.players.filter((p) => p.team === 1).length;
  expect(team0).toBe(2);
  expect(team1).toBe(2);
});

test("player moves at PLAYER.SPEED", () => {
  const state = oneVsOne();
  const p0 = state.players.find((p) => p.id === 0)!;
  const start = p0.x;
  step(state, { 0: { up: false, down: false, left: false, right: true } });
  expect(state.players.find((p) => p.id === 0)!.x).toBeCloseTo(
    start + PLAYER.SPEED,
    6,
  );
});

test("diagonal movement is not faster than orthogonal", () => {
  const state = oneVsOne();
  const p0 = state.players.find((p) => p.id === 0)!;
  const start = { x: p0.x, y: p0.y };
  step(state, { 0: { up: true, down: false, left: false, right: true } });
  const moved = Math.hypot(
    state.players.find((p) => p.id === 0)!.x - start.x,
    state.players.find((p) => p.id === 0)!.y - start.y,
  );
  expect(moved).toBeCloseTo(PLAYER.SPEED, 6);
});

test("ball loses speed to friction", () => {
  const state = oneVsOne();
  state.ball.vx = 40;
  step(state, noInput);
  expect(state.ball.vx).toBeCloseTo(40 * 0.95, 6);
});

test("simulation is deterministic", () => {
  const a = oneVsOne();
  const b = oneVsOne();
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

test("no goals are scored during warmup", () => {
  const state = createGameState(0);
  addPlayer(state, 0);
  state.ball.x = FIELD.WIDTH - 5;
  state.ball.y = FIELD.HEIGHT / 2;
  state.ball.vx = 50;
  step(state, noInput);
  expect(state.score[0]).toBe(0);
  expect(state.status).toBe("warmup");
});

test("goal starts a non-freezing celebration", () => {
  const state = oneVsOne();
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
  const state = oneVsOne();
  state.status = "celebrating" as RoundStatus;
  state.celebrationRemaining = 2;
  const startX = state.players.find((p) => p.id === 0)!.x;
  step(state, { 0: { up: false, down: false, left: false, right: true } });
  expect(state.players.find((p) => p.id === 0)!.x).toBeGreaterThan(startX);
  expect(state.status).toBe("celebrating");
});

test("the goal box contains the ball instead of letting it fly off the map", () => {
  const state = oneVsOne();
  state.status = "celebrating" as RoundStatus;
  state.celebrationRemaining = 10;
  state.ball.y = FIELD.HEIGHT / 2;
  state.ball.x = FIELD.WIDTH - 20;
  state.ball.vx = 500;
  const maxX = FIELD.WIDTH + FIELD.WIDTH * FIELD.GOAL_ZONE_WIDTH_RATIO;
  for (let i = 0; i < 60; i++) {
    step(state, noInput);
    expect(state.ball.x).toBeLessThanOrEqual(maxX);
  }
  expect(Number.isFinite(state.ball.x)).toBe(true);
});

test("cloneState produces an independent copy", () => {
  const state = oneVsOne();
  const snap = cloneState(state);
  step(state, { 0: { up: false, down: false, left: false, right: true } });
  expect(snap.players.find((p) => p.id === 0)!.x).not.toBe(
    state.players.find((p) => p.id === 0)!.x,
  );
});
