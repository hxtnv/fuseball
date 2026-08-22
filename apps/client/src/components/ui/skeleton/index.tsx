import type { JSX } from "preact";
import { cn } from "@/lib/cn";
import styles from "./skeleton.module.scss";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  radius?: string | number;
  class?: string;
}

const px = (v: string | number | undefined): string | undefined =>
  typeof v === "number" ? `${v}px` : v;

/** Shimmering placeholder for loading content. */
export const Skeleton = ({
  width,
  height,
  radius,
  class: cls,
}: SkeletonProps) => {
  const style: JSX.CSSProperties = {
    width: px(width),
    height: px(height),
    borderRadius: px(radius) ?? "4px",
  };
  return <span class={cn(styles.skeleton, cls)} style={style} />;
};
