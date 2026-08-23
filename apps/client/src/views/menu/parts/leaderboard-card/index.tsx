import { ChevronRight, Trophy } from "lucide-react";
import { Box, Skeleton } from "@/components/ui";
import { padRows, useLeaderboard } from "../../hooks/use-leaderboard";
import { LeaderboardPodium } from "../leaderboard-podium";
import styles from "./leaderboard-card.module.scss";

interface LeaderboardCardProps {
  onOpen: () => void;
}

export const LeaderboardCard = ({ onOpen }: LeaderboardCardProps) => {
  const { rows, status } = useLeaderboard(3);

  return (
    <Box flush class={styles.leaderboard}>
      <button class={styles.leaderboard__head} onClick={onOpen}>
        <Trophy size={16} />
        <span class={styles.leaderboard__head__title}>Leaderboard</span>
        <ChevronRight size={16} />
      </button>

      {status === "ready" ? (
        <LeaderboardPodium top3={padRows(rows, 3)} />
      ) : (
        <div class={styles.leaderboard__loading}>
          <Skeleton width={42} height={54} radius={6} />
          <Skeleton width={52} height={74} radius={6} />
          <Skeleton width={42} height={40} radius={6} />
        </div>
      )}
    </Box>
  );
};
