import FaceFrown from "@/assets/icons/face-frown-solid.svg?react";
import styles from "./lobby-list-empty.module.scss";

const LobbyListEmpty: React.FC = () => {
  return (
    <div className={styles.empty}>
      <FaceFrown />

      <div className={styles.empty__text}>
        <h4>No active lobbies</h4>
        <p>Be the first to start the fun and create your own lobby!</p>
      </div>
    </div>
  );
};

export default LobbyListEmpty;
