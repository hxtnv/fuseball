import { useEffect, useState } from "preact/hooks";

// remaining ms -> "3d 4h" / "5h 12m" / "12m 30s"
export const formatCountdown = (ms: number): string => {
  if (ms <= 0) return "0m";
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (d) return `${d}d ${h}h`;
  if (h) return `${h}h ${m}m`;
  return `${m}m ${sec}s`;
};

export const useCountdown = (target: number): string => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  return target ? formatCountdown(target - now) : "";
};
