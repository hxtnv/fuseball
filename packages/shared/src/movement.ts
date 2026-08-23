import { FIELD, PLAYER } from "./constants";
import type { PlayerInput } from "./types";

export const PLAYER_HALF = PLAYER.SIZE / 2;

const GOAL_ZONE_HEIGHT = FIELD.HEIGHT * FIELD.GOAL_ZONE_HEIGHT_RATIO;
const GOAL_DEPTH = FIELD.WIDTH * FIELD.GOAL_ZONE_WIDTH_RATIO;
const CENTER_Y = FIELD.HEIGHT / 2;
export const GOAL_TOP_Y = CENTER_Y - GOAL_ZONE_HEIGHT / 2;
export const GOAL_BOTTOM_Y = CENTER_Y + GOAL_ZONE_HEIGHT / 2;

export interface Vec2 {
  x: number;
  y: number;
}

export interface WallHit {
  x: number; // -1 = left wall, 1 = right wall, 0 = none
  y: number; // -1 = top wall, 1 = bottom wall, 0 = none
}

// One tick of normalized movement. Shared by the authoritative sim and by the
// client's prediction so the two stay in agreement.
export const applyMovement = (
  pos: Vec2,
  input: PlayerInput,
  speed: number = PLAYER.SPEED,
): void => {
  let dx = 0;
  let dy = 0;
  if (input.up) dy -= 1;
  if (input.down) dy += 1;
  if (input.left) dx -= 1;
  if (input.right) dx += 1;
  if (dx === 0 && dy === 0) return;

  // normalize so diagonal movement isn't faster than orthogonal
  const len = Math.hypot(dx, dy);
  pos.x += (dx / len) * speed;
  pos.y += (dy / len) * speed;
};

// Clamps a point to the play area (field + the two goal boxes) and reports which
// walls it hit — the ball uses this to bounce, players to stay contained.
export const constrainToArena = (obj: Vec2, half: number): WallHit => {
  const hit: WallHit = { x: 0, y: 0 };
  const inGoalBand = obj.y > GOAL_TOP_Y && obj.y < GOAL_BOTTOM_Y;

  if (inGoalBand) {
    const backLeft = -GOAL_DEPTH + half;
    const backRight = FIELD.WIDTH + GOAL_DEPTH - half;
    if (obj.x < backLeft) {
      obj.x = backLeft;
      hit.x = -1;
    } else if (obj.x > backRight) {
      obj.x = backRight;
      hit.x = 1;
    }
  } else if (obj.x < half) {
    obj.x = half;
    hit.x = -1;
  } else if (obj.x > FIELD.WIDTH - half) {
    obj.x = FIELD.WIDTH - half;
    hit.x = 1;
  }

  const inGoalBox = obj.x < 0 || obj.x > FIELD.WIDTH;
  if (inGoalBox) {
    if (obj.y < GOAL_TOP_Y + half) {
      obj.y = GOAL_TOP_Y + half;
      hit.y = -1;
    } else if (obj.y > GOAL_BOTTOM_Y - half) {
      obj.y = GOAL_BOTTOM_Y - half;
      hit.y = 1;
    }
  } else if (obj.y < half) {
    obj.y = half;
    hit.y = -1;
  } else if (obj.y > FIELD.HEIGHT - half) {
    obj.y = FIELD.HEIGHT - half;
    hit.y = 1;
  }

  return hit;
};
