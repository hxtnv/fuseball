import type { ComponentChildren, JSX } from "preact";
import styles from "./input.module.css";

interface InputProps {
  label?: string;
  value: string;
  onValue: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  /** icon/button shown inside the field on the right */
  extra?: ComponentChildren;
  onExtraClick?: () => void;
  onEnter?: () => void;
  autoFocus?: boolean;
  class?: string;
}

export function Input({
  label,
  value,
  onValue,
  placeholder,
  maxLength,
  extra,
  onExtraClick,
  onEnter,
  autoFocus,
  class: cls = "",
}: InputProps) {
  const onKeyDown: JSX.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") onEnter?.();
  };

  return (
    <label class={`${styles.field} ${cls}`}>
      {label && <span class={styles.label}>{label}</span>}
      <span class={styles.wrapper}>
        <input
          class={styles.input}
          type="text"
          value={value}
          placeholder={placeholder}
          maxLength={maxLength}
          autoFocus={autoFocus}
          onInput={(e) => onValue(e.currentTarget.value)}
          onKeyDown={onKeyDown}
        />
        {extra && (
          <span class={styles.extra} onClick={onExtraClick}>
            {extra}
          </span>
        )}
      </span>
    </label>
  );
}
