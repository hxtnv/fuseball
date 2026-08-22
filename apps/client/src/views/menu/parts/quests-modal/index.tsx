import { ScrollText } from "lucide-react";
import { Modal } from "@/components/ui";
import { MOCK_QUESTS } from "../../mock";
import styles from "./quests-modal.module.scss";

interface QuestsModalProps {
  open: boolean;
  onClose: () => void;
}

export const QuestsModal = ({ open, onClose }: QuestsModalProps) => (
  <Modal
    open={open}
    onClose={onClose}
    width={460}
    title={{ text: "Daily Quests", icon: <ScrollText /> }}
  >
    <div class={styles.quests}>
      {MOCK_QUESTS.map((quest) => {
        const pct = Math.min(
          100,
          Math.round((quest.progress / quest.goal) * 100),
        );
        const done = quest.progress >= quest.goal;
        return (
          <div class={styles.quests__item} key={quest.title} data-done={done}>
            <div class={styles.quests__item__head}>
              <span class={styles.quests__item__head__title}>
                {quest.title}
              </span>
              <span class={styles.quests__item__head__reward}>
                {quest.reward}
              </span>
            </div>
            <div class={styles.quests__item__bar}>
              <div
                class={styles.quests__item__bar__fill}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span class={styles.quests__item__count}>
              {quest.progress}/{quest.goal}
            </span>
          </div>
        );
      })}
    </div>
  </Modal>
);
