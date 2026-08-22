import type { ComponentChildren, JSX } from "preact";
import { cn } from "@/lib/cn";
import styles from "./button.module.scss";

type Variant = "primary" | "secondary" | "danger";
type Size = "small" | "medium" | "large";
type IconOrientation = "vertical" | "horizontal";

interface ButtonProps {
  children?: ComponentChildren;
  onClick?: JSX.MouseEventHandler<HTMLButtonElement>;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  /** stretch to full width */
  block?: boolean;
  /** leading icon (svg element or <img>), sized by `iconSize` */
  icon?: ComponentChildren;
  /** trailing icon (e.g. a play arrow), styled by the caller */
  iconAfter?: ComponentChildren;
  /** pixel size of the leading icon; default 16 */
  iconSize?: number;
  /** stack the icon above the label (default) or beside it */
  iconOrientation?: IconOrientation;
  class?: string;
  type?: "button" | "submit";
  title?: string;
}

export const Button = ({
  children,
  onClick,
  variant = "primary",
  size = "medium",
  loading,
  disabled,
  block,
  icon,
  iconAfter,
  iconSize = 16,
  iconOrientation = "vertical",
  class: cls,
  type = "button",
  title,
}: ButtonProps) => {
  // vertical stacks the icon above a label+trailing-icon row; horizontal keeps
  // the label inline with a trailing icon that floats to the far right.
  const body =
    iconOrientation === "vertical" ? (
      <span class={styles.button__content}>
        {children}
        {iconAfter && (
          <span class={styles["button__content-after"]}>{iconAfter}</span>
        )}
      </span>
    ) : (
      <>
        {children}
        {iconAfter && (
          <span class={styles["button__content-after"]}>{iconAfter}</span>
        )}
      </>
    );

  return (
    <button
      type={type}
      title={title}
      class={cn(
        "ui-box",
        styles.button,
        styles[`button--${variant}`],
        styles[`button--${size}`],
        Boolean(icon || iconAfter) && styles[`button--${iconOrientation}`],
        block && styles["button--block"],
        cls,
      )}
      style={{ "--btn-icon-size": `${iconSize}px` }}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? (
        <>
          <span class={styles.button__spinner} />
          <span>Loading…</span>
        </>
      ) : (
        <>
          {icon && <span class={styles.button__icon}>{icon}</span>}
          {body}
        </>
      )}
    </button>
  );
};
