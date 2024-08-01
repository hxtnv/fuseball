import { useEffect } from "react";
import useModal from "@/hooks/use-modal/use-modal";
import styles from "./game-loader.module.scss";
import { useGameContext } from "@/context/game.context";

type Props = {
  displayGameSketch: boolean;
};

const GameLoaderModal: React.FC<Props> = ({ displayGameSketch }) => {
  const { currentLobby } = useGameContext();
  const { open, close, Modal } = useModal();

  useEffect(() => {
    if (currentLobby && !displayGameSketch) {
      open();
    } else {
      close();
    }
  }, [currentLobby, displayGameSketch]);

  return (
    <Modal hideCloseButton>
      <div className={styles.loader__modal}>
        <div className={styles.loader__modal__animation} />

        <h4>Loading</h4>
        <p>The game will open soon...</p>
      </div>
    </Modal>
  );
};

export default GameLoaderModal;
