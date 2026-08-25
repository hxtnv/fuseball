import { Clock, Trophy } from "lucide-react";
import { Modal, Skeleton } from "@/components/ui";
import { padRows, useLeaderboard } from "../../hooks/use-leaderboard";
import { useCountdown } from "../../hooks/use-countdown";
import { LeaderboardPodium } from "../leaderboard-podium";
import { Badges } from "../badges";
import styles from "./leaderboard-modal.module.scss";

interface LeaderboardModalProps {
  open: boolean;
  onClose: () => void;
}

export const LeaderboardModal = ({ open, onClose }: LeaderboardModalProps) => {
  const { rows, status, resetsAt } = useLeaderboard(10);
  const countdown = useCountdown(resetsAt);
  const padded = padRows(rows, 10);

  return (
    <Modal
      open={open}
      onClose={onClose}
      width={460}
      title={{ text: "Weekly Leaderboard", icon: <Trophy /> }}
    >
      <div class={styles.leaderboard__reset}>
        <Clock size={13} />
        Resets in {countdown || "…"}
      </div>

      {status !== "ready" ? (
        <div class={styles.leaderboard}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} height={38} radius={6} />
          ))}
        </div>
      ) : (
        <>
          <LeaderboardPodium top3={padded.slice(0, 3)} />

          <div class={styles.leaderboard}>
            {padded.slice(3).map((row) => (
              <div
                class={styles.leaderboard__row}
                key={row.rank}
                data-empty={row.empty ? "true" : undefined}
              >
                <span class={styles.leaderboard__row__rank}>#{row.rank}</span>
                <span class={styles.leaderboard__row__name}>
                  {row.name}
                  {!row.empty && <Badges awards={row.badges} size={14} />}
                </span>
                <span class={styles.leaderboard__row__stat}>
                  {row.empty ? "–" : `${row.wins} wins`}
                </span>
                <span class={styles.leaderboard__row__stat}>
                  {row.empty ? "–" : `${row.goals} goals`}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </Modal>
  );
};
