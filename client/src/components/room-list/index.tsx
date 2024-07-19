import { useGameContext } from "@/context/game.context";
import SingleRoom from "@/components/room-single";
import RoomListActions from "../room-list-actions";
import styles from "./room-list.module.scss";

const RoomList: React.FC = () => {
  const { lobbies } = useGameContext();

  return (
    <div className={styles.list}>
      <RoomListActions />

      <div className={styles.list__header}>
        <p>{lobbies.length} available lobbies</p>
      </div>

      {lobbies.map((lobby) => (
        <SingleRoom {...lobby} key={lobby.id} />
      ))}
    </div>
  );
};

export default RoomList;
