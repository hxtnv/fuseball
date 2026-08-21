import type { JSX } from "preact";
import styles from "./skeleton.module.css";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  radius?: string | number;
  class?: string;
}

const px = (v: string | number | undefined): string | undefined =>
  typeof v === "number" ? `${v}px` : v;

/** Shimmering placeholder for loading content. */
export function Skeleton({
  width,
  height,
  radius,
  class: cls = "",
}: SkeletonProps) {
  const style: JSX.CSSProperties = {
    width: px(width),
    height: px(height),
    borderRadius: px(radius) ?? "4px",
  };
  return <span class={`${styles.skeleton} ${cls}`} style={style} />;
}
