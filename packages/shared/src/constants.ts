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

export const ROUND = {
  TIME: 120, // round length in seconds
  PROTECTED_TIME: 6, // kickoff protection in seconds
  CELEBRATION_TIME: 3.5, // goal celebration length in seconds (players keep moving)
} as const;

export const TEAM_COLORS = ["#ff4b4b", "#4395f9"] as const;
