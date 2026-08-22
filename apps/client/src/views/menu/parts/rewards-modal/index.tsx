import { Gift } from "lucide-react";
import { Button, Modal } from "@/components/ui";
import { MOCK_REWARDS } from "../../mock";
import styles from "./rewards-modal.module.scss";

interface RewardsModalProps {
  open: boolean;
  onClose: () => void;
}

export const RewardsModal = ({ open, onClose }: RewardsModalProps) => (
  <Modal
    open={open}
    onClose={onClose}
    width={460}
    title={{ text: "Daily Rewards", icon: <Gift /> }}
  >
    <div class={styles.rewards}>
      {MOCK_REWARDS.map((reward) => (
        <div
          class={styles.rewards__item}
          key={reward.day}
          data-today={reward.today}
          data-claimed={reward.claimed}
        >
          <span class={styles.rewards__item__day}>Day {reward.day}</span>
          <span class={styles.rewards__item__label}>{reward.label}</span>
        </div>
      ))}
    </div>
    <Button block class={styles.rewards__claim}>
      Claim today’s reward
    </Button>
  </Modal>
);
