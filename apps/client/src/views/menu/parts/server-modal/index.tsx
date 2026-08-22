import { Server as ServerIcon } from "lucide-react";
import { Modal } from "@/components/ui";
import type { GameServerInfo } from "@/lib/auth";
import styles from "./server-modal.module.scss";

interface ServerModalProps {
  open: boolean;
  onClose: () => void;
  servers: GameServerInfo[];
  currentId: string;
  onSelect: (id: string) => void;
}

export const ServerModal = ({
  open,
  onClose,
  servers,
  currentId,
  onSelect,
}: ServerModalProps) => (
  <Modal
    open={open}
    onClose={onClose}
    width={420}
    title={{ text: "Choose a server", icon: <ServerIcon /> }}
  >
    <div class={styles.serverList}>
      {servers.map((server) => (
        <button
          key={server.id}
          class={styles.serverList__item}
          data-active={server.id === currentId}
          onClick={() => {
            onSelect(server.id);
            onClose();
          }}
        >
          <span>
            {server.name} · {server.region}
          </span>
          <span class={styles.serverList__item__meta}>
            {server.online === false
              ? "offline"
              : `${server.players ?? 0} playing`}
          </span>
        </button>
      ))}
    </div>
  </Modal>
);
