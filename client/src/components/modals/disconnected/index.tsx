import { useEffect } from "react";
import emitter from "@/lib/emitter";
import useModal from "@/hooks/use-modal/use-modal";
import styles from "../game-loader/game-loader.module.scss";

const DisconnectedModal: React.FC = () => {
  const { open: openDisconnectedModal, Modal: DisconnectedModal } = useModal();

  const onDisconnected = () => {
    openDisconnectedModal();
  };

  useEffect(() => {
    emitter.on("game:disconnected", onDisconnected);

    return () => {
      emitter.off("game:disconnected", onDisconnected);
    };
  }, []);

  return (
    <DisconnectedModal>
      <div className={styles.loader__modal}>
        <h4>Disconnected!</h4>
        <p>
          A network error has occured. Please check your internet connection.
        </p>
      </div>
    </DisconnectedModal>
  );
};

export default DisconnectedModal;
