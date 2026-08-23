import { TEAM_COLORS } from "@fuseball/shared";
import type { Team } from "@fuseball/shared";
import styles from "./goal-banner.module.scss";

interface GoalBannerProps {
  team: Team | null;
}

// mounts only while a goal is celebrating; the CSS runs a self-contained
// in -> hold -> out cycle so no exit handling is needed
export const GoalBanner = ({ team }: GoalBannerProps) => (
  <div class={styles.goal}>
    <div class={styles.goal__bar}>
      <span
        class={styles.goal__text}
        style={{ color: team !== null ? TEAM_COLORS[team] : "#fff" }}
      >
        Goal!
      </span>
    </div>
  </div>
);
