import { Globe } from "lucide-react";
import { cn } from "@/lib/cn";
import styles from "./flag.module.scss";

interface FlagProps {
  /** ISO 3166-1 alpha-2 country code */
  code?: string;
  /** width in px (height follows the flag aspect) */
  size?: number;
  class?: string;
}

export const Flag = ({ code, size = 28, class: cls }: FlagProps) => {
  if (!code) {
    const h = Math.round((size * 3) / 4);
    return (
      <span
        class={cn(styles.flag, styles["flag--fallback"], cls)}
        style={{ width: `${size}px`, height: `${h}px` }}
      >
        <Globe size={Math.round(size * 0.62)} />
      </span>
    );
  }

  return (
    <img
      class={cn(styles.flag, cls)}
      src={`https://flagcdn.com/w160/${code}.png`}
      style={{ width: `${size}px` }}
      alt=""
    />
  );
};
