// Local, device-scoped settings (persisted to localStorage). No server involved.
const VOLUME_KEY = "fuseball.volume";

export const getVolume = (): number => {
  const raw = localStorage.getItem(VOLUME_KEY);
  const v = raw === null ? 70 : Number(raw);
  return Number.isFinite(v) ? Math.min(100, Math.max(0, v)) : 70;
};

export const setVolume = (v: number): void =>
  localStorage.setItem(VOLUME_KEY, String(Math.round(v)));
