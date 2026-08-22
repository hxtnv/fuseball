import { Modal } from "@/components/ui";
import styles from "./party-modal.module.scss";

interface PartyModalProps {
  open: boolean;
  onClose: () => void;
}

export const PartyModal = ({ open, onClose }: PartyModalProps) => (
  <Modal open={open} onClose={onClose} width={420} title={{ text: "Party" }}>
    <p class={styles.partyModal}>
      Private lobbies &amp; friend invites are coming soon. For now, jump into a
      match with Quick Play!
    </p>
  </Modal>
);
