import { signal, type Signal } from "@preact/signals";
import type { RoundStatus, Team } from "@fuseball/shared";
import type { HudData, HudPlayer } from "@/lib/game";

export interface HudStore {
  connected: Signal<boolean>;
  status: Signal<RoundStatus>;
  score0: Signal<number>;
  score1: Signal<number>;
  time: Signal<number>;
  protectedRemaining: Signal<number>;
  celebrationRemaining: Signal<number>;
  lastScoringTeam: Signal<Team | null>;
  localTeam: Signal<Team | null>;
  localId: Signal<number | null>;
  fps: Signal<number>;
  ping: Signal<number | null>;
  players: Signal<HudPlayer[]>;
  stamina: Signal<number>;
}

export const createHudStore = (): HudStore => ({
  connected: signal(false),
  status: signal<RoundStatus>("warmup"),
  score0: signal(0),
  score1: signal(0),
  time: signal(0),
  protectedRemaining: signal(0),
  celebrationRemaining: signal(0),
  lastScoringTeam: signal<Team | null>(null),
  localTeam: signal<Team | null>(null),
  localId: signal<number | null>(null),
  fps: signal(60),
  ping: signal<number | null>(null),
  players: signal<HudPlayer[]>([]),
  stamina: signal(1),
});

// signals no-op when set to an equal value, so this is cheap to call every frame
export const applyHud = (store: HudStore, h: HudData): void => {
  store.connected.value = h.connected;
  store.status.value = h.status;
  store.score0.value = h.score0;
  store.score1.value = h.score1;
  store.time.value = h.timeRemaining;
  store.protectedRemaining.value = h.protectedRemaining;
  store.celebrationRemaining.value = h.celebrationRemaining;
  store.lastScoringTeam.value = h.lastScoringTeam;
  store.localTeam.value = h.localTeam;
  store.localId.value = h.localId;
  store.fps.value = h.fps;
  store.ping.value = h.ping;
  store.players.value = h.players;
  store.stamina.value = h.stamina;
};
