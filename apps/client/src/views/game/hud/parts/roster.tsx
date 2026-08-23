import { TEAM_COLORS, TEAM_NAMES } from "@fuseball/shared";
import type { Signal } from "@preact/signals";
import type { Team } from "@fuseball/shared";
import { cn } from "@/lib/cn";
import type { HudPlayer } from "@/lib/game";
import styles from "./roster.module.scss";

interface RosterProps {
  players: Signal<HudPlayer[]>;
  team: Team;
  side: "left" | "right";
}

export const Roster = ({ players, team, side }: RosterProps) => {
  const members = players.value.filter((p) => p.team === team);
  if (members.length === 0) return null;

  return (
    <div
      class={cn(styles.roster, styles[`roster--${side}`])}
      style={{ "--team": TEAM_COLORS[team] }}
    >
      <h5 class={styles.roster__title}>Team {TEAM_NAMES[team]}</h5>

      <div className={styles.roster__members}>
        {members.map((p) => (
          <p class={styles.roster__members__item} key={p.id}>
            {p.name}
          </p>
        ))}
      </div>
    </div>
  );
};
