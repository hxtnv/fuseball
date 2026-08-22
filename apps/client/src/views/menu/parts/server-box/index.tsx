import { ChevronRight, Server as ServerIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import type { GameServerInfo } from "@/lib/auth";
import styles from "./server-box.module.scss";

interface ServerBoxProps {
  server: GameServerInfo | undefined;
  onOpen: () => void;
}

export const ServerBox = ({ server, onOpen }: ServerBoxProps) => {
  const meta = server
    ? server.online === false
      ? "offline"
      : `${server.players ?? 0} playing`
    : "no server";

  return (
    <button class={cn("ui-box", styles.serverBox)} onClick={onOpen}>
      <ServerIcon size={18} />
      <div class={styles.serverBox__info}>
        <span class={styles.serverBox__info__name}>{server?.name ?? "—"}</span>
        <span class={styles.serverBox__info__meta}>{meta}</span>
      </div>
      <ChevronRight size={16} />
    </button>
  );
};
