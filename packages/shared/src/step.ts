import { BALL, DT, FIELD, PLAYER, ROUND } from "./constants";
import { resetPositions } from "./state";
import { EMPTY_INPUT } from "./types";
import type {
  BallState,
  GameState,
  InputMap,
  PlayerInput,
  PlayerState,
  Team,
} from "./types";

const PLAYER_HALF = PLAYER.SIZE / 2;
const BALL_HALF = BALL.SIZE / 2;

const GOAL_ZONE_HEIGHT = FIELD.HEIGHT * FIELD.GOAL_ZONE_HEIGHT_RATIO;
const GOAL_DEPTH = FIELD.WIDTH * FIELD.GOAL_ZONE_WIDTH_RATIO;
const CENTER_Y = FIELD.HEIGHT / 2;
const GOAL_TOP_Y = CENTER_Y - GOAL_ZONE_HEIGHT / 2;
const GOAL_BOTTOM_Y = CENTER_Y + GOAL_ZONE_HEIGHT / 2;

interface WallHit {
  x: number; // -1 = left wall, 1 = right wall, 0 = none
  y: number; // -1 = top wall, 1 = bottom wall, 0 = none
}

// Clamps a point to the play area (field + the two goal boxes) and reports which
// walls it hit — the ball uses this to bounce, players to stay contained.
const constrainToArena = (
  obj: { x: number; y: number },
  half: number,
): WallHit => {
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

const applyInput = (player: PlayerState, input: PlayerInput): void => {
  let dx = 0;
  let dy = 0;
  if (input.up) dy -= 1;
  if (input.down) dy += 1;
  if (input.left) dx -= 1;
  if (input.right) dx += 1;
  if (dx === 0 && dy === 0) return;

  // normalize so diagonal movement isn't faster than orthogonal
  const len = Math.hypot(dx, dy);
  player.x += (dx / len) * PLAYER.SPEED;
  player.y += (dy / len) * PLAYER.SPEED;
};

const resolvePlayerCollisions = (players: PlayerState[]): void => {
  const minDist = PLAYER.SIZE; // half + half
  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      const a = players[i]!;
      const b = players[j]!;
      let dx = a.x - b.x;
      let dy = a.y - b.y;
      let dist = Math.hypot(dx, dy);
      if (dist === 0) {
        // deterministic nudge so exactly-overlapping players separate
        dx = 0.01;
        dy = 0;
        dist = 0.01;
      }
      if (dist < minDist) {
        const overlap = (minDist - dist) / 2;
        const nx = dx / dist;
        const ny = dy / dist;
        a.x += nx * overlap;
        a.y += ny * overlap;
        b.x -= nx * overlap;
        b.y -= ny * overlap;
      }
    }
  }
};

// ball inherits the kicking player's momentum, directed from player to ball
const kickBall = (ball: BallState, player: PlayerState): boolean => {
  const dx = ball.x - player.x;
  const dy = ball.y - player.y;
  const dist = Math.hypot(dx, dy);
  const contact = PLAYER_HALF + BALL_HALF;
  if (dist >= contact) return false;

  const nx = dist === 0 ? 1 : dx / dist;
  const ny = dist === 0 ? 0 : dy / dist;
  const strength = Math.hypot(player.vx, player.vy);
  ball.vx = nx * strength;
  ball.vy = ny * strength;

  // shove the ball out of overlap so it doesn't stick to the player
  const push = contact - dist;
  ball.x += nx * push;
  ball.y += ny * push;
  ball.lastTouchedBy = player.id;
  return true;
};

const constrainPlayer = (state: GameState, player: PlayerState): void => {
  constrainToArena(player, PLAYER_HALF); // players may enter the goal boxes

  // during the kickoff window, keep the defending team on their own half
  if (state.status === "protected" && player.team !== state.startingTeam) {
    if (player.team === 0)
      player.x = Math.min(player.x, FIELD.WIDTH / 2 - PLAYER_HALF);
    else player.x = Math.max(player.x, FIELD.WIDTH / 2 + PLAYER_HALF);
  }
};

// integrates the ball for one tick; returns the scoring team if a goal happened
const updateBall = (ball: BallState): Team | null => {
  ball.x += ball.vx;
  ball.y += ball.vy;
  ball.vx *= BALL.FRICTION;
  ball.vy *= BALL.FRICTION;

  // vertical (z) physics — dormant until a lob gives the ball vz
  if (ball.z > 0 || ball.vz !== 0) {
    ball.vz -= BALL.GRAVITY;
    ball.z += ball.vz;
    if (ball.z <= 0) {
      ball.z = 0;
      ball.vz = ball.vz < -1 ? -ball.vz * BALL.RESTITUTION : 0;
    }
  }

  // a goal is scored when the ball crosses a goal line within the goal band
  const inGoalBand = ball.y > GOAL_TOP_Y && ball.y < GOAL_BOTTOM_Y;
  let scored: Team | null = null;
  if (inGoalBand) {
    if (ball.x < 0) scored = 1;
    else if (ball.x > FIELD.WIDTH) scored = 0;
  }

  // the goal boxes have collision, so the ball is contained and bounces
  const hit = constrainToArena(ball, BALL_HALF);
  if (hit.x !== 0) ball.vx = -ball.vx * BALL.WALL_BOUNCE;
  if (hit.y !== 0) ball.vy = -ball.vy * BALL.WALL_BOUNCE;

  return scored;
};

/**
 * Advances the game one fixed tick (DT seconds). Deterministic and mutating —
 * the same input on the same state always yields the same result, which is what
 * makes client prediction/reconciliation against the server safe.
 */
export const step = (state: GameState, inputs: InputMap): GameState => {
  if (state.status === "finished") return state;

  state.tick++;

  const prev = state.players.map((p) => ({ x: p.x, y: p.y }));

  for (const player of state.players) {
    applyInput(player, inputs[player.id] ?? EMPTY_INPUT);
  }

  resolvePlayerCollisions(state.players);

  state.players.forEach((player, i) => {
    const before = prev[i]!;
    player.vx = player.x - before.x;
    player.vy = player.y - before.y;
  });

  let kickoffTouched = false;
  for (const player of state.players) {
    const kicked = kickBall(state.ball, player);
    if (kicked && player.team === state.startingTeam) kickoffTouched = true;
  }

  for (const player of state.players) constrainPlayer(state, player);

  const scoringTeam = updateBall(state.ball);

  if (state.status === "protected") {
    state.protectedRemaining -= DT;
    if (state.protectedRemaining <= 0 || kickoffTouched) state.status = "live";
  }

  if (state.status === "celebrating") {
    // players keep moving and new goals don't count; reset to kickoff when it ends
    state.celebrationRemaining -= DT;
    if (state.celebrationRemaining <= 0) {
      resetPositions(state);
      state.status = "protected";
    }
  } else if (scoringTeam !== null) {
    state.score[scoringTeam] += 1;
    state.lastScoringTeam = scoringTeam;
    state.startingTeam = (scoringTeam === 0 ? 1 : 0) as Team; // conceding team kicks off next
    state.status = "celebrating";
    state.celebrationRemaining = ROUND.CELEBRATION_TIME;
  }

  if (
    state.status === "protected" ||
    state.status === "live" ||
    state.status === "celebrating"
  ) {
    state.timeRemaining -= DT;
    if (state.timeRemaining <= 0) {
      state.timeRemaining = 0;
      state.status = "finished";
    }
  }

  return state;
};
