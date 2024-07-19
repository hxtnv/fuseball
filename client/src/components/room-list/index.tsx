import { useGameContext } from "@/context/game.context";
import SingleRoom from "@/components/room-single";
import RoomListActions from "@/components/room-list-actions";
import RoomListError from "@/components/room-list-error";
import Skeleton from "@/components/common/skeleton";
import styles from "./room-list.module.scss";
import { useWebSocket } from "@/context/websocket.context";

const RoomList: React.FC = () => {
  const { status } = useWebSocket();
  const { lobbies } = useGameContext();

  return (
    <div className={styles.list}>
      <RoomListActions />

      <div
        className={styles.list__header}
        style={status === "connected" ? undefined : { visibility: "hidden" }}
      >
        <p>{lobbies.length} available lobbies</p>
      </div>

      {status === "connecting" && (
        <>
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} height="86px" />
          ))}
        </>
      )}

      {status === "connected" &&
        lobbies.map((lobby) => <SingleRoom {...lobby} key={lobby.id} />)}

      {status === "error" || (status === "disconnected" && <RoomListError />)}
    </div>
  );
};

export default RoomList;
