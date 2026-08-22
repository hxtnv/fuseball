import { ChevronRight } from "lucide-react";
import { Flag } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { GameServerInfo } from "@/lib/auth";
import { pingColor, pingLabel } from "../../hooks/use-servers-ping";
import styles from "./server-box.module.scss";

interface ServerBoxProps {
  server: GameServerInfo | undefined;
  ping: number | null | undefined;
  onOpen: () => void;
}

export const ServerBox = ({ server, ping, onOpen }: ServerBoxProps) => (
  <button class={cn("ui-box", styles.serverBox)} onClick={onOpen}>
    <Flag code={server?.flag} size={28} />
    <div class={styles.serverBox__info}>
      <span class={styles.serverBox__info__name}>{server?.name ?? "—"}</span>
      <span class={styles.serverBox__info__meta}>
        {server?.region ?? "no server"}
      </span>
    </div>
    <span class={styles.serverBox__ping} style={{ color: pingColor(ping) }}>
      {pingLabel(ping, server?.online)}
    </span>
    <ChevronRight size={16} />
  </button>
);
