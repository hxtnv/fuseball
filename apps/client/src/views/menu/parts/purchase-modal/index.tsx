import { Button, Modal } from "@/components/ui";
import styles from "./purchase-modal.module.scss";

interface PurchaseModalProps {
  open: boolean;
  emoji: { slug: string; label: string } | null;
  busy?: boolean;
  onEquip: () => void;
  onContinue: () => void;
}

export const PurchaseModal = ({
  open,
  emoji,
  busy,
  onEquip,
  onContinue,
}: PurchaseModalProps) => (
  <Modal
    open={open}
    onClose={onContinue}
    width={360}
    title={{ text: "Purchase complete!" }}
  >
    <div class={styles.purchase}>
      {emoji && (
        <img
          class={styles.purchase__emoji}
          src={`/emojis/${emoji.slug}.png`}
          alt={emoji.label}
        />
      )}
      <p class={styles.purchase__title}>
        You unlocked <strong>{emoji?.label}</strong>!
      </p>
      <p class={styles.purchase__hint}>
        Slap it on now and show it off, or keep hunting for more.
      </p>

      <div class={styles.purchase__actions}>
        <Button loading={busy} onClick={onEquip}>
          Equip now
        </Button>

        <Button variant="secondary" onClick={onContinue}>
          Continue
        </Button>
      </div>
    </div>
  </Modal>
);
