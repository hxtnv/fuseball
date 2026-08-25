import { Avatar } from "@/components/ui";
import { Badges } from "../badges";
import type { LbRow } from "../../hooks/use-leaderboard";
import styles from "./leaderboard-podium.module.scss";

interface LeaderboardPodiumProps {
  top3: LbRow[]; // exactly 3 rows, in rank order (padded with placeholders)
}

// shared podium used by both the sidebar card and the full leaderboard modal
export const LeaderboardPodium = ({ top3 }: LeaderboardPodiumProps) => {
  const [first, second, third] = top3;
  // arrange 2nd - 1st - 3rd so the winner sits centre
  const order = [second, first, third].filter((r): r is LbRow => !!r);

  return (
    <div class={styles.podium}>
      {order.map((row) => (
        <div
          class={styles.podium__slot}
          data-rank={row.rank}
          data-empty={row.empty ? "true" : undefined}
          key={row.rank}
        >
          {row.empty ? (
            <div class={styles.podium__slot__ph} />
          ) : (
            <Avatar
              name={row.name}
              skin={row.skin}
              size={row.rank === 1 ? 52 : 42}
            />
          )}
          <span class={styles.podium__slot__name}>{row.name}</span>
          <span class={styles.podium__slot__score}>
            {row.empty ? "–" : `${row.wins} W`}
          </span>
          {!row.empty && <Badges awards={row.badges} size={16} />}
          <div class={styles.podium__slot__base}>{row.rank}</div>
        </div>
      ))}
    </div>
  );
};
