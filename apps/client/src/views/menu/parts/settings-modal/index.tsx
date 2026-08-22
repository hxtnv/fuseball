import { Settings } from "lucide-react";
import { Button, Modal } from "@/components/ui";
import styles from "./settings-modal.module.scss";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export const SettingsModal = ({ open, onClose }: SettingsModalProps) => (
  <Modal
    open={open}
    onClose={onClose}
    width={420}
    title={{ text: "Settings", icon: <Settings /> }}
  >
    <div class={styles.settings}>
      <div class={styles.settings__row}>
        <span class={styles.settings__row__label}>Sound</span>
        <Button variant="secondary" size="small">
          On
        </Button>
      </div>
      <div class={styles.settings__row}>
        <span class={styles.settings__row__label}>Graphics</span>
        <Button variant="secondary" size="small">
          Auto
        </Button>
      </div>
      <div class={styles.settings__row}>
        <span class={styles.settings__row__label}>Account</span>
        <Button size="small">Sign in</Button>
      </div>
    </div>
  </Modal>
);
