import { PLAYER, TEAM_COLORS } from "@fuseball/shared";

// -----------------------------------------------------------------------------
// Single source of truth for all client-side (visual/tuning) constants.
// Gameplay/simulation constants live in @fuseball/shared (constants.ts).
// -----------------------------------------------------------------------------

export const FONT_FAMILY = "'Itim', system-ui, sans-serif";

export const COLORS = {
  grass: "rgb(111, 173, 78)",
  line: "rgba(255, 255, 255, 0.95)",
  stripe: "rgba(0, 0, 0, 0.06)",
  stripeBorder: "rgba(0, 0, 0, 0.06)",
  net: "rgba(255, 255, 255, 0.70)",
  goalShadow: "rgba(0, 0, 0, 0.3)", // darkens the goal recess and anything inside it
  entityShadow: "rgba(0, 0, 0, 0.14)",
  outline: "rgb(51, 51, 51)",
  playerBody: "rgb(253, 200, 118)", // default skin; custom skins later. Team is shown via tag color.
  hud: "#ffffff",
} as const;

// Team is communicated purely through the player-tag colour (skin-agnostic).
export const TAG_COLORS = TEAM_COLORS;
export const TEAM_NAMES = ["Red", "Blue"] as const;

// Cosmetic field markings only — the field geometry itself is in shared FIELD.
export const FIELD_STYLE = {
  penaltyAreaHeightRatio: 0.6,
  penaltyAreaWidthRatio: 0.16,
  goalAreaHeightRatio: 0.4,
  goalAreaWidthRatio: 0.08,
  cornerArc: 40,
  gridSpacing: 75,
  outerRadius: 8,
  innerRadius: 10,
  lineWeight: 5,
  stripeBorderWeight: 3,
} as const;

export const CAMERA = {
  viewWorldHeight: 900, // world px shown vertically at baseline zoom
  minScale: 0.3,
  maxScale: 1.4,
} as const;

export const ENTITY = {
  shadowRatio: 1.42, // shadow disc diameter relative to entity size
  outlineWeight: 4,
} as const;

export const TAG = {
  font: `700 16px ${FONT_FAMILY}`,
  outline: "rgb(51, 51, 51)",
  outlineWeight: 4,
  offset: PLAYER.SIZE * 0.8, // world px above the player centre
} as const;

export const GAME = {
  maxFrame: 0.1, // frames longer than this (e.g. tab switch) are ignored in the fps stat
} as const;

// The authoritative game server (server-game). Multi-region selection comes later.
export const SERVER = {
  wsUrl: "ws://localhost:3002/ws",
} as const;

// The central server (auth, profiles, server picker, room list).
export const API = {
  baseUrl: import.meta.env.VITE_API_URL ?? "http://localhost:3001",
} as const;

export const NET = {
  interpTicks: 3, // sim ticks in the past to render remotes (jitter buffer, ~100ms)
  maxBuffer: 30, // snapshots retained for interpolation
  smoothTau: 0.01, // s — local player/camera smoothing (lower = snappier, higher = smoother)
  ballTau: 0.015, // s — ball smoothing
  // Ball timeline blend: the ball is drawn on the delayed remote-player timeline
  // (buffer-interpolated) so remote kicks line up with the kicker, but blends to the
  // predicted present-time ball as the LOCAL player gets close, keeping own touches instant.
  ballControlNear: 55, // px — at/under this local-player→ball distance the ball is fully predicted
  ballControlFar: 130, // px — at/over this distance the ball is fully interpolated (remote timeline)
  ballReleaseTau: 0.35, // s — how slowly possession fades after the local player leaves the ball
  reconnectMs: 1000, // delay before auto-reconnecting a dropped socket
} as const;

export interface QualitySettings {
  name: "potato" | "full";
  maxDpr: number;
}

export const FULL: QualitySettings = { name: "full", maxDpr: 2 };
export const POTATO: QualitySettings = { name: "potato", maxDpr: 1 };

export const detectInitialQuality = (): QualitySettings => {
  const nav = navigator as Navigator & { deviceMemory?: number };
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 4;
  return cores <= 2 || memory <= 2 ? POTATO : FULL;
};
