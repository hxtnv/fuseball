import { API } from "@/lib/game/config";
import type { BadgeAward } from "@/lib/auth";
import { useBadges } from "../../hooks/use-badges";
import styles from "./badges.module.scss";

interface BadgesProps {
  awards: BadgeAward[];
  size?: number;
}

// resolves earned badge awards to catalog images (URLs come from the server);
// each award's per-win description is shown as the tooltip
export const Badges = ({ awards, size = 16 }: BadgesProps) => {
  const map = useBadges();
  if (awards.length === 0) return null;

  return (
    <span class={styles.badges}>
      {awards.map((a, i) => {
        const b = map.get(a.name);
        if (!b) return null;
        const src = /^https?:/.test(b.image)
          ? b.image
          : `${API.baseUrl}${b.image}`;
        return (
          <img
            key={`${a.name}-${i}`}
            class={styles.badges__img}
            src={src}
            alt={b.label}
            title={a.description || b.label}
            width={size}
            height={size}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        );
      })}
    </span>
  );
};
