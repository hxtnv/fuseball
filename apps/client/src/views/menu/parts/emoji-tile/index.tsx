import type { JSX } from "preact";
import { Check, Lock } from "lucide-react";
import { cn } from "@/lib/cn";
import styles from "./emoji-tile.module.scss";

type Status = "idle" | "loading" | "success";

interface EmojiTileProps {
  slug: string;
  label: string;
  /** shown under the name unless omitted (or when `ownedTag` is set) */
  price?: number;
  /** themed border + check badge (the equipped one) */
  selected?: boolean;
  /** greyed out + lock badge (not obtainable here) */
  locked?: boolean;
  /** show an "Owned" pill instead of a price */
  ownedTag?: boolean;
  /** hover CTA that covers the whole tile */
  overlay?: { icon: JSX.Element; label: string };
  /** inline action state for the overlay (loading spinner / success) */
  status?: Status;
  successLabel?: string;
  onClick?: () => void;
}

export const EmojiTile = ({
  slug,
  label,
  price,
  selected,
  locked,
  ownedTag,
  overlay,
  status = "idle",
  successLabel = "Done",
  onClick,
}: EmojiTileProps) => {
  const busy = status === "loading";
  const done = status === "success";

  return (
    <div
      title={label}
      onClick={busy ? undefined : onClick}
      class={cn(
        styles.tile,
        onClick && styles["tile--clickable"],
        selected && styles["tile--selected"],
        locked && styles["tile--locked"],
      )}
    >
      {selected ? (
        <span class={styles.tile__badge}>
          <Check size={12} strokeWidth={3} />
        </span>
      ) : (
        locked && (
          <span class={cn(styles.tile__badge, styles["tile__badge--lock"])}>
            <Lock size={11} strokeWidth={2.5} />
          </span>
        )
      )}

      <img
        class={styles.tile__img}
        src={`/emojis/${slug}.png`}
        alt={label}
        loading="lazy"
      />
      <span class={styles.tile__name}>{label}</span>

      {ownedTag ? (
        <span class={styles.tile__owned}>Owned</span>
      ) : (
        price != null && (
          <span class={styles.tile__price}>
            <img src="/icons/currency/coin/gold.png" alt="" />
            {price.toLocaleString()}
          </span>
        )
      )}

      {busy ? (
        <span class={cn(styles.tile__overlay, styles["tile__overlay--shown"])}>
          <span class={styles.tile__spinner} />
        </span>
      ) : done ? (
        <span
          class={cn(
            styles.tile__overlay,
            styles["tile__overlay--shown"],
            styles["tile__overlay--success"],
          )}
        >
          <Check size={16} strokeWidth={3} />
          {successLabel}
        </span>
      ) : (
        overlay && (
          <span class={styles.tile__overlay}>
            {overlay.icon}
            {overlay.label}
          </span>
        )
      )}
    </div>
  );
};
