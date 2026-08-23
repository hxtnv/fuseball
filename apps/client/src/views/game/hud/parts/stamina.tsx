import type { Signal } from "@preact/signals";
import styles from "./stamina.module.scss";

interface StaminaBarProps {
  value: Signal<number>; // 0..1
}

export const StaminaBar = ({ value }: StaminaBarProps) => (
  <div class={styles.stamina}>
    <span
      class={styles.stamina__fill}
      style={{ width: `${Math.round(value.value * 100)}%` }}
    />
  </div>
);
