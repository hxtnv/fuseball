import type { ComponentChildren, JSX } from "preact";
import { cn } from "@/lib/cn";
import styles from "./input.module.scss";

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

export const Input = ({
  label,
  value,
  onValue,
  placeholder,
  maxLength,
  extra,
  onExtraClick,
  onEnter,
  autoFocus,
  class: cls,
}: InputProps) => {
  const onKeyDown: JSX.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") onEnter?.();
  };

  return (
    <label class={cn(styles.input, cls)}>
      {label && <span class={styles.input__label}>{label}</span>}
      <span class={styles.input__wrapper}>
        <input
          class={styles.input__control}
          type="text"
          value={value}
          placeholder={placeholder}
          maxLength={maxLength}
          autoFocus={autoFocus}
          onInput={(e) => onValue(e.currentTarget.value)}
          onKeyDown={onKeyDown}
        />
        {extra && (
          <span class={styles.input__extra} onClick={onExtraClick}>
            {extra}
          </span>
        )}
      </span>
    </label>
  );
};
