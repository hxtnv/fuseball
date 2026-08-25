import { useEffect, useState } from "preact/hooks";
import { fetchBadges, type Badge } from "@/lib/auth";

// the catalog rarely changes; fetch it once and share across the app
let cache: Promise<Badge[]> | null = null;
const load = (): Promise<Badge[]> => (cache ??= fetchBadges());

export const useBadges = (): Map<string, Badge> => {
  const [map, setMap] = useState<Map<string, Badge>>(new Map());
  useEffect(() => {
    let alive = true;
    load().then((list) => {
      if (alive) setMap(new Map(list.map((b) => [b.name, b])));
    });
    return () => {
      alive = false;
    };
  }, []);
  return map;
};
