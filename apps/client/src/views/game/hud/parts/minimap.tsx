import { FIELD, TEAM_COLORS } from "@fuseball/shared";
import type { Signal } from "@preact/signals";
import type { HudPlayer } from "@/lib/game";
import styles from "./minimap.module.scss";

const MAP_W = 240;
const MAP_H = Math.round((MAP_W * FIELD.HEIGHT) / FIELD.WIDTH);

interface MinimapProps {
  players: Signal<HudPlayer[]>;
}

// dots are placed with transform (compositor-only) instead of left/top, so 8
// players updating at ~12Hz never trigger layout; CSS eases between updates
export const Minimap = ({ players }: MinimapProps) => (
  <div class={styles.minimap} style={{ width: MAP_W, height: MAP_H }}>
    <span class={styles.minimap__line} />
    {players.value.map((p) => (
      <span
        key={p.id}
        class={styles.minimap__dot}
        style={{
          background: TEAM_COLORS[p.team],
          transform: `translate(calc(${(p.x / FIELD.WIDTH) * MAP_W}px - 50%), calc(${(p.y / FIELD.HEIGHT) * MAP_H}px - 50%))`,
        }}
      />
    ))}
  </div>
);
