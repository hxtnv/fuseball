import { useState } from "preact/hooks";
import { Settings } from "lucide-react";
import { Button, Modal } from "@/components/ui";
import { getVolume, setVolume } from "@/lib/settings";
import styles from "./settings-modal.module.scss";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export const SettingsModal = ({ open, onClose }: SettingsModalProps) => {
  const [volume, setVol] = useState(getVolume);

  const onVolume = (e: Event) => {
    const v = Number((e.currentTarget as HTMLInputElement).value);
    setVol(v);
    setVolume(v);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      width={420}
      title={{ text: "Settings", icon: <Settings /> }}
    >
      <div class={styles.settings}>
        <div class={styles.settings__row}>
          <span class={styles.settings__row__label}>Volume</span>
          <div class={styles.settings__volume}>
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onInput={onVolume}
              class={styles.settings__volume__slider}
            />
            <span class={styles.settings__volume__value}>{volume}</span>
          </div>
        </div>
        <div class={styles.settings__row}>
          <span class={styles.settings__row__label}>Graphics</span>
          <Button variant="secondary" size="small">
            Auto
          </Button>
        </div>
      </div>
    </Modal>
  );
};
