import { useEffect, useState } from "preact/hooks";

const easeOutCubic = (k: number): number => 1 - Math.pow(1 - k, 3);

interface CountUpProps {
  value: number;
  /** animation length in ms */
  duration?: number;
  /** wait this long before starting (ms) */
  delay?: number;
  format?: (n: number) => string;
  class?: string;
}

// Counts a number up from 0 to `value`. rAF-driven with a self-contained delay
// (no setTimeout) and cancelled on unmount.
export const CountUp = ({
  value,
  duration = 1000,
  delay = 0,
  format,
  class: cls,
}: CountUpProps) => {
  const [n, setN] = useState(0);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start - delay;
      const k = elapsed <= 0 ? 0 : Math.min(1, elapsed / duration);
      setN(Math.round(value * easeOutCubic(k)));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration, delay]);

  return <span class={cls}>{format ? format(n) : n.toLocaleString()}</span>;
};
