import { useGameContext } from "@/context/game.context";
import Button from "@/components/common/button";
import SingleRoom from "@/components/room-single";
import Cog from "@/assets/icons/cog-solid.svg?react";
import User from "@/assets/icons/user-solid.svg?react";
import styles from "./room-list.module.scss";

const RoomList: React.FC = () => {
  const { lobbies } = useGameContext();

  return (
    <div className={styles.list}>
      <div className={styles.list__actions}>
        <Button disabled={false}>Create a lobby</Button>
        <Button variant="secondary">
          <User />
        </Button>
        <Button variant="secondary">
          <Cog />
        </Button>
      </div>

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
