import { useState, useEffect } from "react";
import LobbyList from "@/components/lobby-list";
import GameSketch from "@/views/game-sketch";
import { useGameContext } from "@/context/game.context";
import logo from "@/assets/logo.png";
import styles from "./home.module.scss";
import useModal from "@/hooks/use-modal/use-modal";
import Footer from "@/components/footer";

const Home: React.FC = () => {
  const [displayGameSketch, setDisplayGameSketch] = useState(false);
  const { currentLobby } = useGameContext();

  const { open, close, Modal } = useModal();

  useEffect(() => {
    if (currentLobby) {
      open();
    }

    const timeout = setTimeout(
      () => {
        if (currentLobby) close();

        setDisplayGameSketch(!!currentLobby);
      },
      currentLobby ? 1500 : 0
    );

    return () => {
      clearTimeout(timeout);
    };
  }, [currentLobby]);

  if (displayGameSketch) {
    return <GameSketch />;
  }

  return (
    <div className={styles.home}>
      <Modal hideCloseButton>
        <div className={styles.loader__modal}>
          <div className={styles.loader__modal__animation} />

          <h4>Loading</h4>
          <p>The game will open soon...</p>
        </div>
      </Modal>

      <img src={logo} alt="Fuseball logo" className={styles.logo} />

      <p className={styles.description}>
        Fuseball is a casual browser based multiplayer football game where you
        can compete with your friends or other players from all over the world!
      </p>

      <LobbyList />
      <Footer />
    </div>
  );
};

export default Home;
