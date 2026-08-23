import type { ComponentChildren, MouseEventHandler } from "preact";
import { cn } from "@/lib/cn";
import styles from "./button.module.scss";

type Variant = "primary" | "secondary" | "danger" | "tertiary";
type Size = "small" | "medium" | "large";
type IconOrientation = "vertical" | "horizontal";

interface ButtonProps {
  children?: ComponentChildren;
  onClick?: MouseEventHandler<HTMLButtonElement>;
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
  /** place the icon beside the label (default) or stacked above it */
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
  iconOrientation = "horizontal",
  class: cls,
  type = "button",
  title,
}: ButtonProps) => {
  const after = iconAfter && (
    <span class={styles["button__content-after"]}>{iconAfter}</span>
  );

  // no label -> just the icon (skip the empty content wrapper). vertical stacks
  // the icon above the label; horizontal keeps them inline.
  const body =
    children == null ? (
      after
    ) : iconOrientation === "vertical" ? (
      <span class={styles.button__content}>
        {children}
        {after}
      </span>
    ) : (
      <>
        {children}
        {after}
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
