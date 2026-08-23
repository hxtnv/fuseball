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

const clampN = (v: number, lo: number, hi: number): number =>
  v < lo ? lo : v > hi ? hi : v;

// Clamps a point to the play area (field + the two goal boxes) and reports which
// walls it hit — the ball uses this to bounce, players to stay contained. The
// area is the union of three rectangles; when outside all of them we snap to the
// nearest one, which keeps the concave goal-mouth corners leak- and teleport-free.
export const constrainToArena = (obj: Vec2, half: number): WallHit => {
  const fx0 = half;
  const fx1 = FIELD.WIDTH - half;
  const fy0 = half;
  const fy1 = FIELD.HEIGHT - half;
  const by0 = GOAL_TOP_Y + half;
  const by1 = GOAL_BOTTOM_Y - half;
  const lx0 = -GOAL_DEPTH + half;
  const rx1 = FIELD.WIDTH + GOAL_DEPTH - half;

  const inField = obj.x >= fx0 && obj.x <= fx1 && obj.y >= fy0 && obj.y <= fy1;
  const inLeft = obj.x >= lx0 && obj.x <= fx0 && obj.y >= by0 && obj.y <= by1;
  const inRight = obj.x >= fx1 && obj.x <= rx1 && obj.y >= by0 && obj.y <= by1;
  if (inField || inLeft || inRight) return { x: 0, y: 0 };

  // outside every rectangle: project onto each and keep the nearest (minimal move)
  let bestX = clampN(obj.x, fx0, fx1);
  let bestY = clampN(obj.y, fy0, fy1);
  let bestD = (bestX - obj.x) ** 2 + (bestY - obj.y) ** 2;

  const lxc = clampN(obj.x, lx0, fx0);
  const lyc = clampN(obj.y, by0, by1);
  const ld = (lxc - obj.x) ** 2 + (lyc - obj.y) ** 2;
  if (ld < bestD) {
    bestD = ld;
    bestX = lxc;
    bestY = lyc;
  }

  const rxc = clampN(obj.x, fx1, rx1);
  const ryc = clampN(obj.y, by0, by1);
  const rd = (rxc - obj.x) ** 2 + (ryc - obj.y) ** 2;
  if (rd < bestD) {
    bestX = rxc;
    bestY = ryc;
  }

  const hit: WallHit = { x: 0, y: 0 };
  if (bestX !== obj.x) hit.x = bestX > obj.x ? -1 : 1;
  if (bestY !== obj.y) hit.y = bestY > obj.y ? -1 : 1;
  obj.x = bestX;
  obj.y = bestY;
  return hit;
};
