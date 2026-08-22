import { Coins, Gift, ScrollText, Settings, Trophy } from "lucide-react";
import { cn } from "@/lib/cn";
import { MOCK_QUESTS } from "../../mock";
import styles from "./top-bar.module.scss";

interface TopBarProps {
  coins: number;
  onQuests: () => void;
  onLeaderboard: () => void;
  onRewards: () => void;
  onSettings: () => void;
}

export const TopBar = ({
  coins,
  onQuests,
  onLeaderboard,
  onRewards,
  onSettings,
}: TopBarProps) => {
  const quest = MOCK_QUESTS.find((q) => q.progress < q.goal) ?? MOCK_QUESTS[0];
  const pct = quest
    ? Math.min(100, Math.round((quest.progress / quest.goal) * 100))
    : 0;

  return (
    <div class={styles.topBar}>
      <div class={styles.topBar__side}>
        {quest && (
          <button
            class={styles.topBar__quest}
            onClick={onQuests}
            title="Quests"
          >
            <span class={styles.topBar__quest__icon}>
              <ScrollText size={18} />
            </span>
            <span class={styles.topBar__quest__body}>
              <span class={styles.topBar__quest__body__title}>
                {quest.title}
              </span>
              <span class={styles.topBar__quest__body__bar}>
                <span
                  class={styles.topBar__quest__body__bar__fill}
                  style={{ width: `${pct}%` }}
                />
              </span>
            </span>
            <span class={styles.topBar__quest__count}>
              {quest.progress}/{quest.goal}
            </span>
          </button>
        )}
      </div>

      <img class={styles.topBar__logo} src="/logo.png" alt="Fuseball" />

      <div class={cn(styles.topBar__side, styles["topBar__side--end"])}>
        <div class={styles.topBar__coins}>
          <Coins size={18} /> {coins.toLocaleString()}
        </div>
        <button
          class={styles.topBar__button}
          onClick={onLeaderboard}
          title="Leaderboard"
        >
          <Trophy size={20} />
        </button>
        <button
          class={styles.topBar__button}
          onClick={onRewards}
          title="Rewards"
        >
          <Gift size={20} />
        </button>
        <button
          class={styles.topBar__button}
          onClick={onSettings}
          title="Settings"
        >
          <Settings size={20} />
        </button>
      </div>
    </div>
  );
};
