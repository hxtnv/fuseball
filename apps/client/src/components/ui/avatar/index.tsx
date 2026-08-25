import type { JSX } from "preact";
import { cn } from "@/lib/cn";
import styles from "./avatar.module.scss";

type OnlineStatus = "online" | "in-game" | "offline";

interface AvatarProps {
  name: string;
  /** active emoji slug; renders the emoji, falling back to initials */
  skin?: string;
  /** diameter in px */
  size?: number;
  /** show a corner status dot when provided */
  onlineStatus?: OnlineStatus;
  class?: string;
}

const initials = (name: string) =>
  (
    name.match(/[A-Z]/g)?.slice(0, 2).join("") ?? name.slice(0, 2)
  ).toUpperCase();

const hueFromName = (name: string) =>
  [...name].reduce((sum, c) => sum + c.charCodeAt(0), 0) % 360;

export const Avatar = ({
  name,
  skin,
  size = 34,
  onlineStatus,
  class: cls,
}: AvatarProps) => {
  const style: JSX.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    fontSize: `${Math.round(size * 0.36)}px`,
    ...(skin ? {} : { background: `hsl(${hueFromName(name)} 55% 42%)` }),
  };

  return (
    <span class={cn(styles.avatar, cls)} style={style}>
      {skin ? (
        <img
          src={`/emojis/${skin}.png`}
          alt={name}
          class={styles.avatar__image}
        />
      ) : (
        initials(name)
      )}

      {onlineStatus && (
        <span
          class={cn(styles.avatar__dot, styles[`avatar__dot--${onlineStatus}`])}
        />
      )}
    </span>
  );
};
