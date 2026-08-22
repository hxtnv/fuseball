import { ChevronRight, Trophy } from "lucide-react";
import { Avatar, Box } from "@/components/ui";
import { MOCK_LEADERBOARD, type LeaderRow } from "../../mock";
import styles from "./leaderboard-card.module.scss";

interface LeaderboardCardProps {
  onOpen: () => void;
}

export const LeaderboardCard = ({ onOpen }: LeaderboardCardProps) => {
  const [first, second, third] = MOCK_LEADERBOARD;
  // arrange as 2nd - 1st - 3rd so the winner sits centre on the podium
  const podium = [second, first, third].filter((r): r is LeaderRow => !!r);

  return (
    <Box flush class={styles.leaderboard}>
      <button class={styles.leaderboard__head} onClick={onOpen}>
        <Trophy size={16} />
        <span class={styles.leaderboard__head__title}>Leaderboard</span>
        <ChevronRight size={16} />
      </button>

      <div class={styles.leaderboard__podium}>
        {podium.map((row) => (
          <div
            class={styles.leaderboard__podium__slot}
            data-rank={row.rank}
            key={row.rank}
          >
            <Avatar name={row.name} size={row.rank === 1 ? 52 : 42} />
            <span class={styles.leaderboard__podium__slot__name}>
              {row.name}
            </span>
            <span class={styles.leaderboard__podium__slot__score}>
              {row.wins} W
            </span>
            <div class={styles.leaderboard__podium__slot__base}>{row.rank}</div>
          </div>
        ))}
      </div>
    </Box>
  );
};
