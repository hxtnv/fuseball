import { FIELD, KICK } from "@fuseball/shared";
import type { GameState, PlayerInput, PlayerState } from "@fuseball/shared";

export type BotRole = "attacker" | "defender";

export interface BotMemory {
  role: BotRole;
  think: number; // ticks until the bot re-plans (gives it a human-ish lag)
  jx: number; // aim jitter, refreshed each re-plan
  jy: number;
  input: PlayerInput; // cached between re-plans
}

const NAMES = [
  "Ada",
  "Bolt",
  "Chip",
  "Dash",
  "Echo",
  "Fox",
  "Gus",
  "Hex",
  "Iris",
  "Jet",
  "Kilo",
  "Nova",
];

export const botName = (i: number): string =>
  `[BOT] ${NAMES[i % NAMES.length]}`;

export const createBotMemory = (role: BotRole): BotMemory => ({
  role,
  think: 0,
  jx: 0,
  jy: 0,
  input: { up: false, down: false, left: false, right: false, kick: false },
});

const clamp = (v: number, lo: number, hi: number): number =>
  v < lo ? lo : v > hi ? hi : v;

const APPROACH = 34; // stand this far behind the ball to line up a shot
const DEAD = 8; // movement deadzone (px) toward the target
const STOP = 16; // within this of the target, stand still (a beat of calm)
const GUARD_DEPTH = FIELD.WIDTH * 0.16;
const LANE = FIELD.HEIGHT * 0.22; // vertical spread for off-ball attackers

const dist2 = (ax: number, ay: number, bx: number, by: number): number => {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
};

// Produces one tick of input for a bot. Only the teammate nearest the ball
// commits to it; the rest hold open lanes so they don't clump. Bots re-plan on a
// slow cadence and stand still near their target, which reads as deliberate.
export const computeBotInput = (
  state: GameState,
  bot: PlayerState,
  mem: BotMemory,
): PlayerInput => {
  // during the opponent's kickoff the defending team waits instead of storming
  // in, so the restart isn't instant chaos
  if (state.status === "protected" && bot.team !== state.startingTeam) {
    mem.think = 0; // re-plan the moment play goes live
    return { up: false, down: false, left: false, right: false, kick: false };
  }

  if (mem.think > 0) {
    mem.think -= 1;
    return mem.input;
  }
  mem.think = 6 + Math.floor(Math.random() * 7); // commit for ~230-430ms
  mem.jx = (Math.random() * 2 - 1) * 12;
  mem.jy = (Math.random() * 2 - 1) * 12;

  const ball = state.ball;
  const goalX = bot.team === 0 ? FIELD.WIDTH : 0;
  const ownX = bot.team === 0 ? 0 : FIELD.WIDTH;
  const goalY = FIELD.HEIGHT / 2;
  const ballInOwnThird =
    bot.team === 0 ? ball.x < FIELD.WIDTH / 3 : ball.x > (FIELD.WIDTH * 2) / 3;

  // only the closest teammate to the ball chases it; the others give it space
  let chaserId = bot.id;
  let best = dist2(bot.x, bot.y, ball.x, ball.y);
  for (const p of state.players) {
    if (p.team !== bot.team) continue;
    const d = dist2(p.x, p.y, ball.x, ball.y);
    if (d < best) {
      best = d;
      chaserId = p.id;
    }
  }
  const isChaser = chaserId === bot.id;

  let targetX: number;
  let targetY: number;
  let goForBall = false;

  if (mem.role === "defender" && !ballInOwnThird) {
    // hold a guarding spot in front of our goal, tracking the ball's height
    targetX = ownX + (bot.team === 0 ? GUARD_DEPTH : -GUARD_DEPTH);
    targetY = clamp(ball.y, FIELD.HEIGHT * 0.25, FIELD.HEIGHT * 0.75);
  } else if (isChaser) {
    // approach from the goal-opposite side so a touch sends the ball forward
    const gx = goalX - ball.x;
    const gy = goalY - ball.y;
    const gl = Math.hypot(gx, gy) || 1;
    targetX = ball.x - (gx / gl) * APPROACH + mem.jx;
    targetY = ball.y - (gy / gl) * APPROACH + mem.jy;
    goForBall = true;
  } else {
    // stay open ahead of the ball toward the goal, in a spread lane
    const lane = bot.id % 2 === 0 ? -LANE : LANE;
    targetX = (ball.x + goalX) / 2;
    targetY = clamp(ball.y + lane, FIELD.HEIGHT * 0.15, FIELD.HEIGHT * 0.85);
  }

  const dx = targetX - bot.x;
  const dy = targetY - bot.y;
  const far = Math.hypot(dx, dy);
  const input: PlayerInput = {
    up: false,
    down: false,
    left: false,
    right: false,
    kick: false,
    sprint: false,
  };
  // only move if it's worth it — hovering near the target avoids the twitchiness
  if (far > STOP) {
    input.left = dx < -DEAD;
    input.right = dx > DEAD;
    input.up = dy < -DEAD;
    input.down = dy > DEAD;
    // sprint only to close a big gap, and rarely — constant sprinting looks silly
    if (bot.stamina > 0.55 && far > 260 && Math.random() < 0.15)
      input.sprint = true;
  }

  // kick when we're on the ball and roughly lined up toward the goal
  if (goForBall) {
    const bx = ball.x - bot.x;
    const by = ball.y - bot.y;
    const bd = Math.hypot(bx, by) || 1;
    if (bd < KICK.RANGE) {
      const gx = goalX - ball.x;
      const gy = goalY - ball.y;
      const gl = Math.hypot(gx, gy) || 1;
      const dot = (bx / bd) * (gx / gl) + (by / bd) * (gy / gl);
      if (dot > 0.55) input.kick = true;
    }
  }

  mem.input = input;
  return input;
};
