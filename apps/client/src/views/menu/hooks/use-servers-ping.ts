import { useEffect, useState } from "preact/hooks";
import type { GameServerInfo } from "@/lib/auth";

export type PingMap = Record<string, number | null>;

const originOf = (wsUrl: string): string => {
  const u = new URL(wsUrl);
  u.protocol = u.protocol === "wss:" ? "https:" : "http:";
  return u.origin;
};

// no-cors keeps the request from failing on missing CORS headers; the opaque
// response still resolves, so the round-trip time is measurable.
const pingOnce = async (wsUrl: string): Promise<number | null> => {
  try {
    const t0 = performance.now();
    await fetch(`${originOf(wsUrl)}/health`, {
      cache: "no-store",
      mode: "no-cors",
    });
    return Math.round(performance.now() - t0);
  } catch {
    return null;
  }
};

/** Measures round-trip latency to each game server, refreshed every 5s. */
export const useServersPing = (servers: GameServerInfo[]): PingMap => {
  const [pings, setPings] = useState<PingMap>({});
  const key = servers.map((s) => s.wsUrl).join("|");

  useEffect(() => {
    if (!servers.length) return;
    let alive = true;

    const measure = async () => {
      // many servers can share one origin (esp. the dev demo regions); probing
      // them all at once creates self-inflicted contention that inflates the
      // numbers, so ping each unique origin once, sequentially, then fan out.
      const origins = [...new Set(servers.map((s) => originOf(s.wsUrl)))];
      const byOrigin = new Map<string, number | null>();
      for (const origin of origins)
        byOrigin.set(origin, await pingOnce(origin));
      if (alive)
        setPings(
          Object.fromEntries(
            servers.map((s) => [s.id, byOrigin.get(originOf(s.wsUrl)) ?? null]),
          ),
        );
    };

    measure();
    const t = setInterval(measure, 5000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [key]);

  return pings;
};

export const pingColor = (ms: number | null | undefined): string => {
  if (ms == null) return "var(--ui-text-dim)";
  if (ms < 60) return "var(--ui-theme)";
  if (ms < 120) return "var(--ui-gold)";
  return "var(--ui-danger)";
};

export const pingLabel = (
  ms: number | null | undefined,
  online?: boolean,
): string => {
  if (online === false) return "offline";
  if (ms == null) return "—";
  return `${ms} ms`;
};
