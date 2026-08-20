import { FIELD, ROUND } from "./constants";
import type { GameState, PlayerState, Team } from "./types";

const spawnPositionsFor = (
  team: Team,
  teamSize: number,
): { x: number; y: number }[] => {
  const x = FIELD.WIDTH * (team === 0 ? 0.25 : 0.75);
  const spots: { x: number; y: number }[] = [];
  for (let i = 0; i < teamSize; i++) {
    const t = (i + 1) / (teamSize + 1);
    spots.push({ x, y: FIELD.HEIGHT * t });
  }
  return spots;
};

export const createGameState = (
  teamSize = 1,
  startingTeam: Team = 0,
): GameState => {
  const players: PlayerState[] = [];
  let id = 0;
  for (const team of [0, 1] as Team[]) {
    for (const spot of spawnPositionsFor(team, teamSize)) {
      players.push({ id: id++, team, x: spot.x, y: spot.y, vx: 0, vy: 0 });
    }
  }

  return {
    tick: 0,
    status: "protected",
    teamSize,
    startingTeam,
    players,
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
  };
};

export const resetPositions = (state: GameState): void => {
  let i = 0;
  for (const team of [0, 1] as Team[]) {
    for (const spot of spawnPositionsFor(team, state.teamSize)) {
      const player = state.players[i++];
      if (!player) continue;
      player.x = spot.x;
      player.y = spot.y;
      player.vx = 0;
      player.vy = 0;
    }
  }

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

export const cloneState = (state: GameState): GameState =>
  structuredClone(state);
