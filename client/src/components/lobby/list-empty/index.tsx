import FaceFrown from "@/assets/icons/face-frown-solid.svg?react";
import styles from "./lobby-list-empty.module.scss";

const LobbyListEmpty: React.FC = () => {
  return (
    <div className={styles.empty}>
      <FaceFrown />

      <div className={styles.empty__text}>
        <h4>No active lobbies</h4>
        <p>
          You can still play! Create your own lobby to fool around in warmup
          mode while waiting for other players to join.
        </p>
      </div>
    </div>
  );
};

export default LobbyListEmpty;
