import { Trophy } from "lucide-react";
import { Modal } from "@/components/ui";
import { MOCK_LEADERBOARD } from "../../mock";
import styles from "./leaderboard-modal.module.scss";

interface LeaderboardModalProps {
  open: boolean;
  onClose: () => void;
}

export const LeaderboardModal = ({ open, onClose }: LeaderboardModalProps) => (
  <Modal
    open={open}
    onClose={onClose}
    width={460}
    title={{ text: "Leaderboard", icon: <Trophy /> }}
  >
    <div class={styles.leaderboard}>
      {MOCK_LEADERBOARD.map((row) => (
        <div
          class={styles.leaderboard__row}
          key={row.rank}
          data-top={row.rank <= 3}
        >
          <span class={styles.leaderboard__row__rank}>#{row.rank}</span>
          <span class={styles.leaderboard__row__name}>{row.name}</span>
          <span class={styles.leaderboard__row__stat}>{row.wins} wins</span>
          <span class={styles.leaderboard__row__stat}>{row.goals} goals</span>
        </div>
      ))}
    </div>
  </Modal>
);
