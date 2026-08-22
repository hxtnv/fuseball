import { Server as ServerIcon } from "lucide-react";
import { Button, Flag, Modal } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { GameServerInfo } from "@/lib/auth";
import {
  pingColor,
  pingLabel,
  type PingMap,
} from "../../hooks/use-servers-ping";
import styles from "./server-modal.module.scss";

interface ServerModalProps {
  open: boolean;
  onClose: () => void;
  servers: GameServerInfo[];
  pings: PingMap;
  currentId: string;
  onSelect: (id: string) => void;
}

export const ServerModal = ({
  open,
  onClose,
  servers,
  pings,
  currentId,
  onSelect,
}: ServerModalProps) => {
  const sorted = [...servers].sort(
    (a, b) => (pings[a.id] ?? Infinity) - (pings[b.id] ?? Infinity),
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      width={460}
      title={{ text: "Choose a server", icon: <ServerIcon /> }}
    >
      <div class={styles.serverGrid}>
        {sorted.map((server) => {
          const ping = pings[server.id];
          return (
            <Button
              key={server.id}
              block
              variant="secondary"
              class={cn(
                styles.serverGrid__item,
                server.id === currentId && styles["serverGrid__item--active"],
              )}
              onClick={() => {
                onSelect(server.id);
                onClose();
              }}
            >
              <span class={styles.serverGrid__item__body}>
                <Flag code={server.flag} size={40} />
                <span class={styles.serverGrid__item__name}>{server.name}</span>
                <span class={styles.serverGrid__item__region}>
                  {server.region}
                </span>
                <span
                  class={styles.serverGrid__item__ping}
                  style={{ color: pingColor(ping) }}
                >
                  {pingLabel(ping, server.online)}
                </span>
              </span>
            </Button>
          );
        })}
      </div>
    </Modal>
  );
};
