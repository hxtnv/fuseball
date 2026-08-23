export type Team = 0 | 1;

export type RoundStatus =
  | "warmup"
  | "protected"
  | "live"
  | "celebrating"
  | "finished";

export interface PlayerState {
  id: number;
  team: Team;
  x: number;
  y: number;
  vx: number; // net movement over the last tick (render + kick strength)
  vy: number;
  stamina: number; // 0..1, drained by sprinting, regenerates when released
}

export interface BallState {
  x: number;
  y: number;
  z: number; // height above the pitch (0 = on the ground)
  vx: number;
  vy: number;
  vz: number;
  lastTouchedBy: number | null;
}

export interface GameState {
  tick: number;
  status: RoundStatus;
  startingTeam: Team;
  players: PlayerState[];
  ball: BallState;
  score: [number, number];
  timeRemaining: number; // seconds
  protectedRemaining: number; // seconds left of the kickoff window
  celebrationRemaining: number; // seconds left of the goal celebration (players keep moving)
  lastScoringTeam: Team | null; // team that scored the most recent goal (for the overlay)
}

export interface PlayerInput {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  kick?: boolean;
  sprint?: boolean;
}

export type InputMap = Record<number, PlayerInput | undefined>;

export const EMPTY_INPUT: PlayerInput = {
  up: false,
  down: false,
  left: false,
  right: false,
  kick: false,
  sprint: false,
};
