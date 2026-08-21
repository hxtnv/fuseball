import type { ComponentChildren, JSX } from "preact";
import styles from "./box.module.css";

interface BoxProps {
  children?: ComponentChildren;
  /** extra class names */
  class?: string;
  /** remove the default inner padding */
  flush?: boolean;
  onClick?: JSX.MouseEventHandler<HTMLDivElement>;
  style?: string | JSX.CSSProperties;
}

/** Chunky game-style panel (the `.ui-box` frame + default padding). */
export function Box({
  children,
  class: cls = "",
  flush,
  onClick,
  style,
}: BoxProps) {
  return (
    <div
      class={`ui-box ${flush ? "" : styles.box} ${cls}`}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  );
}
