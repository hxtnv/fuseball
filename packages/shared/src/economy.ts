// Match rewards + XP/level curve. Lives in shared so the server can award the
// exact numbers the client shows on the end-game screen.

export type MatchResult = "win" | "loss" | "draw";

// --- coins -----------------------------------------------------------------
const COIN_BASE = 25; // just for showing up + playing it out
const COIN_PER_GOAL = 20;
const COIN_MIN = 30; // nobody leaves empty-handed
const RESULT_MULT: Record<MatchResult, number> = {
  win: 1.5,
  draw: 1,
  loss: 0.5,
};

export const matchCoins = (goals: number, result: MatchResult): number =>
  Math.max(
    COIN_MIN,
    Math.round((COIN_BASE + goals * COIN_PER_GOAL) * RESULT_MULT[result]),
  );

// --- xp --------------------------------------------------------------------
const XP_BASE = 40;
const XP_PER_GOAL = 30;
const XP_WIN = 120;

export const matchXp = (goals: number, result: MatchResult): number =>
  XP_BASE + goals * XP_PER_GOAL + (result === "win" ? XP_WIN : 0);

// rough lifetime XP from cumulative stats, so a returning player has a real level
export const lifetimeXp = (stats: {
  goals: number;
  wins: number;
  gamesPlayed: number;
}): number =>
  stats.gamesPlayed * XP_BASE + stats.wins * XP_WIN + stats.goals * XP_PER_GOAL;

// --- levels ----------------------------------------------------------------
// XP required to advance FROM `level` to the next one (a gentle ramp).
export const xpToNext = (level: number): number => 300 + (level - 1) * 200;

export interface LevelProgress {
  level: number;
  into: number; // xp earned into the current level
  span: number; // xp needed to finish the current level
}

export const levelFromXp = (totalXp: number): LevelProgress => {
  let level = 1;
  let remaining = Math.max(0, Math.floor(totalXp));
  while (remaining >= xpToNext(level)) {
    remaining -= xpToNext(level);
    level += 1;
  }
  return { level, into: remaining, span: xpToNext(level) };
};
