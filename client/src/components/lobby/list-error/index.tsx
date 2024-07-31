import TriangleExclamation from "@/assets/icons/triangle-exclamation-solid.svg?react";
import styles from "./lobby-list-error.module.scss";

const LobbyListError: React.FC = () => {
  return (
    <div className={`${styles.error} generic-box`}>
      <div className={styles.error__header}>
        <TriangleExclamation />

        <div className={styles.error__content}>
          <h4>Oops, failed to connect!</h4>
          <p>
            Please check your internet connection or try again later. We will
            keep trying to reconnect in the background.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LobbyListError;
