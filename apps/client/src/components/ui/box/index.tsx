import type { ComponentChildren, JSX } from "preact";
import { cn } from "@/lib/cn";
import styles from "./box.module.scss";

interface BoxProps {
  children?: ComponentChildren;
  class?: string;
  /** remove the default inner padding */
  flush?: boolean;
  onClick?: JSX.MouseEventHandler<HTMLDivElement>;
  style?: string | JSX.CSSProperties;
}

/** Chunky game-style panel (the `.ui-box` frame + default padding). */
export const Box = ({
  children,
  class: cls,
  flush,
  onClick,
  style,
}: BoxProps) => (
  <div
    class={cn("ui-box", !flush && styles.box, cls)}
    onClick={onClick}
    style={style}
  >
    {children}
  </div>
);
