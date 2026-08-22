import { Button } from "@/components/ui";
import { cn } from "@/lib/cn";
import styles from "./wallet-strip.module.scss";

interface WalletStripProps {
  coins: number;
  onRewards: () => void;
}

export const WalletStrip = ({ coins, onRewards }: WalletStripProps) => (
  <div class={cn("ui-box", styles.wallet)}>
    <span class={styles.wallet__label}>Your balance</span>

    <div class={styles.wallet__coins}>
      <img
        class={styles.wallet__coins__icon}
        src="/icons/currency/coin/gold.png"
        alt="Coins"
      />
      <span class={styles.wallet__coins__value}>{coins.toLocaleString()}</span>
    </div>

    <Button
      block
      iconSize={20}
      icon={<img src="/icons/ui/gift.png" alt="" />}
      class={styles.wallet__rewards}
      onClick={onRewards}
    >
      Daily Rewards
    </Button>
  </div>
);
