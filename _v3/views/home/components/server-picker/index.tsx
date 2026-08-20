import Skeleton from "@/components/common/skeleton";
import styles from "./server-picker.module.scss";
import { Fragment, useMemo } from "react";
import { ChartNoAxesColumnIcon, PencilIcon } from "lucide-react";
import type { Server } from "shared/types/api";
import useModal from "@/hooks/use-modal";
import useGameServerContext from "@/hooks/context/use-game-server";
import classNames from "classnames";
import getPingColor from "@/lib/helpers/get-ping-color";

const ServerPreview = ({
  onClick,
  data,
  selected,
  icon,
}: {
  onClick: (data: Server) => void;
  data: Server;
  selected?: boolean;
  icon?: React.ReactNode;
}) => {
  const { pings } = useGameServerContext();

  const ping = useMemo(() => {
    return pings[data.id] ?? -2;
  }, [pings, data.id]);

  const pingText = useMemo(() => {
    if (ping === -2) return "Connecting...";
    if (ping === -1) return "Failed to connect!";

    return `${ping}ms`;
  }, [ping]);

  const isDisabled = ping < 0;

  const classes = classNames(styles.picker, "generic-box", {
    [styles.selected]: selected,
    [styles.disabled]: isDisabled,
  });

  return (
    <div className={classes} onClick={() => !isDisabled && onClick(data)}>
      <div className={styles.picker__image}>
        <img src={data.image} alt={data.name} />
      </div>

      <div className={styles.picker__content}>
        <h4>{data.name}</h4>
        <p style={{ color: getPingColor(ping) }}>
          {ping >= 0 && <ChartNoAxesColumnIcon />}
          <span>{pingText}</span>
        </p>
      </div>

      <div className={styles.picker__actions}>{icon}</div>
    </div>
  );
};

const ServerPicker = () => {
  const { list, selectedServer, setSelectedServer } = useGameServerContext();

  const { show, hide, visibility, Modal } = useModal();

  if (!list.length || !selectedServer) {
    return <Skeleton style={{ height: "64px" }} />;
  }

  return (
    <Fragment>
      <Modal
        hide={hide}
        visibility={visibility}
        title="Server picker"
        width={400}
      >
        <div className={styles.modal}>
          <h5>
            For the best experience, choose a server with the lowest ping. If
            you're playing with a friend, make sure you are both connected to
            the same server.
          </h5>

          {list.map((serverItem) => (
            <ServerPreview
              key={serverItem.id}
              onClick={() => {
                setSelectedServer(serverItem);
                hide();
              }}
              data={serverItem}
              selected={serverItem.id === selectedServer?.id}
              icon={undefined}
            />
          ))}
        </div>
      </Modal>

      <ServerPreview
        onClick={show}
        data={selectedServer}
        icon={<PencilIcon />}
      />
    </Fragment>
  );
};

export default ServerPicker;
