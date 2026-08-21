import { FIELD, ROUND } from "./constants";
import type { GameState, PlayerState, Team } from "./types";

const teamX = (team: Team): number => FIELD.WIDTH * (team === 0 ? 0.25 : 0.75);

const countTeam = (state: GameState, team: Team): number =>
  state.players.reduce((n, p) => n + (p.team === team ? 1 : 0), 0);

// spread one team evenly down its half of the pitch
const spaceTeam = (state: GameState, team: Team): void => {
  const members = state.players.filter((p) => p.team === team);
  members.forEach((p, i) => {
    p.x = teamX(team);
    p.y = FIELD.HEIGHT * ((i + 1) / (members.length + 1));
    p.vx = 0;
    p.vy = 0;
  });
};

export const createGameState = (startingTeam: Team = 0): GameState => ({
  tick: 0,
  status: "warmup",
  startingTeam,
  players: [],
  ball: {
    x: FIELD.WIDTH / 2,
    y: FIELD.HEIGHT / 2,
    z: 0,
    vx: 0,
    vy: 0,
    vz: 0,
    lastTouchedBy: null,
  },
  score: [0, 0],
  timeRemaining: ROUND.TIME,
  protectedRemaining: ROUND.PROTECTED_TIME,
  celebrationRemaining: 0,
  lastScoringTeam: null,
});

// adds a player to the smaller team (or the given one), spawning on their half
export const addPlayer = (
  state: GameState,
  id: number,
  team?: Team,
): PlayerState => {
  const assigned: Team =
    team ?? (countTeam(state, 0) <= countTeam(state, 1) ? 0 : 1);
  const player: PlayerState = {
    id,
    team: assigned,
    x: teamX(assigned),
    y: FIELD.HEIGHT / 2,
    vx: 0,
    vy: 0,
  };
  state.players.push(player);
  return player;
};

export const removePlayer = (state: GameState, id: number): void => {
  state.players = state.players.filter((p) => p.id !== id);
};

export const resetPositions = (state: GameState): void => {
  spaceTeam(state, 0);
  spaceTeam(state, 1);

  const ball = state.ball;
  ball.x = FIELD.WIDTH / 2;
  ball.y = FIELD.HEIGHT / 2;
  ball.z = 0;
  ball.vx = 0;
  ball.vy = 0;
  ball.vz = 0;
  ball.lastTouchedBy = null;
  state.protectedRemaining = ROUND.PROTECTED_TIME;
};

// (re)start a match: fresh score/clock, kickoff positions, protected window
export const startMatch = (state: GameState): void => {
  state.score = [0, 0];
  state.timeRemaining = ROUND.TIME;
  state.celebrationRemaining = 0;
  state.lastScoringTeam = null;
  state.status = "protected";
  resetPositions(state);
};

export const cloneState = (state: GameState): GameState =>
  structuredClone(state);
