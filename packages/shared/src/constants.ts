export const GAME_VERSION = "0.1.0";

export const TICK_RATE = 30;
export const DT = 1 / TICK_RATE;

export const FIELD = {
  WIDTH: 1440,
  HEIGHT: 1440 * 0.55, // 792
  MIDDLE_CIRCLE_RATIO: 0.2,
  GOAL_ZONE_WIDTH_RATIO: 0.1,
  GOAL_ZONE_HEIGHT_RATIO: 0.3,
} as const;

export const PLAYER = {
  SIZE: 40,
  SPEED: 8, // px per tick (330 px/s @ 30Hz)
} as const;

export const BALL = {
  SIZE: 30,
  FRICTION: 0.95, // per tick
  GRAVITY: 1.2, // z acceleration per tick (px/tick^2)
  RESTITUTION: 0.6, // vertical bounce energy retained
  WALL_BOUNCE: 1, // horizontal/vertical wall restitution
} as const;

export const KICK = {
  FORCE: 22, // ball speed imparted by an active kick (px per tick)
  RANGE: 46, // max centre-to-centre distance to connect with the ball
} as const;

export const SPRINT = {
  SPEED_MULT: 1.6, // top speed while sprinting, relative to PLAYER.SPEED
  DRAIN: 1 / (TICK_RATE * 2.5), // full stamina empties in ~2.5s of sprinting
  REGEN: 1 / (TICK_RATE * 6), // refills in ~6s once released
} as const;

export const ROUND = {
  TIME: 120, // round length in seconds
  PROTECTED_TIME: 6, // kickoff protection in seconds
  CELEBRATION_TIME: 3.5, // goal celebration length in seconds (players keep moving)
} as const;

export const TEAM_COLORS = ["#ff4b4b", "#4395f9"] as const;

export const TEAM_NAMES = ["Red", "Blue"] as const;

export const ROOM = {
  MAX_PLAYERS: 6, // per room (3v3); later filled with bots that real players replace
} as const;
