import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/cn";
import styles from "./wallet-strip.module.scss";

interface WalletStripProps {
  coins: number;
  onStore: () => void;
}

export const WalletStrip = ({ coins, onStore }: WalletStripProps) => (
  <div class={cn("ui-box", styles.wallet)}>
    <div class={styles.wallet__balance}>
      <img
        class={styles.wallet__balance__icon}
        src="/icons/currency/coin/gold.png"
        alt="Coins"
      />
      <div class={styles.wallet__balance__body}>
        <span class={styles.wallet__label}>Your balance</span>
        <span class={styles.wallet__balance__value}>
          {coins.toLocaleString()}
        </span>
      </div>
    </div>

    <Button
      block
      variant="secondary"
      icon={<ShoppingBag size={16} />}
      onClick={onStore}
    >
      Emoji Store
    </Button>
  </div>
);
