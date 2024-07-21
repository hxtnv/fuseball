import { useGameContext } from "@/context/game.context";
import SingleLobby from "@/components/lobby-single";
import LobbyListActions from "@/components/lobby-list-actions";
import LobbyListError from "@/components/lobby-list-error";
import Skeleton from "@/components/common/skeleton";
import styles from "./lobby-list.module.scss";
import { useWebSocket } from "@/context/websocket.context";

const LobbyList: React.FC = () => {
  const { status } = useWebSocket();
  const { lobbies, playersOnline } = useGameContext();

  const showCount = status === "connected";

  return (
    <div className={styles.list}>
      <LobbyListActions />

      <div
        className={styles.list__header}
        style={showCount ? undefined : { visibility: "hidden" }}
      >
        <p>
          <span>{lobbies.length}</span> available lobbies
        </p>

        <p>
          <span>{playersOnline}</span> player{playersOnline !== 1 ? "s" : ""}{" "}
          online
        </p>
      </div>

      {status === "connecting" && (
        <>
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} height="86px" />
          ))}
        </>
      )}

      {status === "connected" && (
        <>
          {lobbies.map((lobby) => (
            <SingleLobby {...lobby} key={lobby.id} />
          ))}
        </>
      )}

      {["disconnected", "error"].includes(status) && <LobbyListError />}
    </div>
  );
};

export default LobbyList;
