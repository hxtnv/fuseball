import styles from "./admin.module.scss";

// Tiny dependency-free charts. Because this file is only imported by the
// (lazy-loaded) admin view, it never lands in the main bundle.

interface LineChartProps {
  points: { t: number; v: number }[];
}

export const LineChart = ({ points }: LineChartProps) => {
  if (points.length < 2)
    return <div class={styles.chart__empty}>Not enough data yet.</div>;

  const W = 600;
  const H = 160;
  const P = 8;
  const xs = points.map((p) => p.t);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const maxY = Math.max(1, ...points.map((p) => p.v));
  const sx = (t: number) => P + ((t - minX) / (maxX - minX || 1)) * (W - 2 * P);
  const sy = (v: number) => H - P - (v / maxY) * (H - 2 * P);
  const line = points
    .map(
      (p, i) => `${i ? "L" : "M"}${sx(p.t).toFixed(1)},${sy(p.v).toFixed(1)}`,
    )
    .join(" ");
  const area = `${line} L${sx(maxX).toFixed(1)},${H - P} L${sx(minX).toFixed(1)},${H - P} Z`;

  return (
    <svg
      class={styles.chart}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="ccuFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--ui-theme)" stop-opacity="0.35" />
          <stop offset="100%" stop-color="var(--ui-theme)" stop-opacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#ccuFill)" />
      <path
        d={line}
        fill="none"
        stroke="var(--ui-theme)"
        stroke-width="2"
        vector-effect="non-scaling-stroke"
      />
    </svg>
  );
};

interface BarChartProps {
  bars: { label: string; value: number }[];
  max?: number; // fixed scale (e.g. 100 for percentages); defaults to data max
  format?: (v: number) => string;
}

export const BarChart = ({ bars, max, format }: BarChartProps) => {
  if (bars.length === 0)
    return <div class={styles.chart__empty}>No data yet.</div>;
  const top = max ?? Math.max(1, ...bars.map((b) => b.value));

  return (
    <div class={styles.bars}>
      {bars.map((b, i) => (
        <div
          class={styles.bars__col}
          key={`${b.label}-${i}`}
          title={`${b.label}: ${format ? format(b.value) : b.value}`}
        >
          <div class={styles.bars__col__track}>
            <div
              class={styles.bars__col__fill}
              style={{ height: `${Math.min(100, (b.value / top) * 100)}%` }}
            />
          </div>
          <span class={styles.bars__col__label}>{b.label}</span>
        </div>
      ))}
    </div>
  );
};
