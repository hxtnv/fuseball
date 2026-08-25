import { useMemo, useState } from "preact/hooks";
import { ShoppingBag } from "lucide-react";
import { EMOJIS, type Emoji } from "@fuseball/shared";
import { Modal, toast } from "@/components/ui";
import type { User } from "@/lib/auth";
import { EmojiTile } from "../emoji-tile";
import { PurchaseModal } from "../purchase-modal";
import styles from "./store-modal.module.scss";

interface StoreModalProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onBuy: (slug: string) => Promise<void>;
  onEquip: (slug: string) => Promise<void>;
}

export const StoreModal = ({
  open,
  user,
  onClose,
  onBuy,
  onEquip,
}: StoreModalProps) => {
  const owned = new Set(user?.ownedSkins ?? []);
  const balance = user?.balance ?? 0;
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [congrats, setCongrats] = useState<Emoji | null>(null);
  const [equipBusy, setEquipBusy] = useState(false);

  // cheapest first; owned items sink to the bottom
  const emojis = useMemo(
    () =>
      [...EMOJIS].sort((a, b) => {
        const rank = Number(owned.has(a.slug)) - Number(owned.has(b.slug));
        return rank || a.price - b.price;
      }),
    [user?.ownedSkins],
  );

  const buy = async (e: Emoji) => {
    if (loading[e.slug]) return;
    setLoading((s) => ({ ...s, [e.slug]: true }));
    try {
      await onBuy(e.slug);
      // stay in the loading state right up until the congrats modal takes over
      setCongrats(e);
    } catch (err) {
      const reason = err instanceof Error ? err.message : "";
      toast.error(
        reason === "insufficient"
          ? "Not enough coins for that emoji."
          : "Purchase failed. Please try again.",
      );
    } finally {
      setLoading(({ [e.slug]: _removed, ...rest }) => rest);
    }
  };

  const equip = async () => {
    if (!congrats) return;
    setEquipBusy(true);
    try {
      await onEquip(congrats.slug);
      setCongrats(null);
    } finally {
      setEquipBusy(false);
    }
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        width={560}
        title={{ text: "Emoji Store", icon: <ShoppingBag /> }}
      >
        <div class={styles.store}>
          <div class={styles.store__balance}>
            <span class={styles.store__balance__label}>Your balance</span>
            <span class={styles.store__balance__coins}>
              <img src="/icons/currency/coin/gold.png" alt="Coins" />
              {balance.toLocaleString()}
            </span>
          </div>

          <div class={styles.store__grid}>
            {emojis.map((e) => {
              const isLoading = loading[e.slug];
              // keep the buyable tile while its purchase animates, even once owned
              if (owned.has(e.slug) && !isLoading) {
                return (
                  <EmojiTile
                    key={e.slug}
                    slug={e.slug}
                    label={e.label}
                    ownedTag
                    selected={e.slug === user?.skin}
                  />
                );
              }
              // can't afford it yet — greyed out, not buyable
              if (balance < e.price && !isLoading) {
                return (
                  <EmojiTile
                    key={e.slug}
                    slug={e.slug}
                    label={e.label}
                    price={e.price}
                    locked
                  />
                );
              }
              return (
                <EmojiTile
                  key={e.slug}
                  slug={e.slug}
                  label={e.label}
                  price={e.price}
                  overlay={{ icon: <ShoppingBag size={14} />, label: "Buy" }}
                  status={isLoading ? "loading" : "idle"}
                  onClick={() => buy(e)}
                />
              );
            })}
          </div>
        </div>
      </Modal>

      <PurchaseModal
        open={!!congrats}
        emoji={congrats}
        busy={equipBusy}
        onEquip={equip}
        onContinue={() => setCongrats(null)}
      />
    </>
  );
};
