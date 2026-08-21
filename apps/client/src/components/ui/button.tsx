import type { ComponentChildren, JSX } from "preact";
import styles from "./button.module.css";

interface ButtonProps {
  children?: ComponentChildren;
  onClick?: JSX.MouseEventHandler<HTMLButtonElement>;
  variant?: "primary" | "secondary" | "danger";
  size?: "small" | "medium" | "large";
  loading?: boolean;
  disabled?: boolean;
  /** stretch to full width */
  block?: boolean;
  class?: string;
  type?: "button" | "submit";
  title?: string;
}

export function Button({
  children,
  onClick,
  variant = "primary",
  size = "medium",
  loading,
  disabled,
  block,
  class: cls = "",
  type = "button",
  title,
}: ButtonProps) {
  return (
    <button
      type={type}
      title={title}
      class={`ui-box ${styles.btn} ${block ? styles.block : ""} ${cls}`}
      data-variant={variant}
      data-size={size}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? (
        <>
          <span class={styles.spinner} />
          <span>Loading…</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
