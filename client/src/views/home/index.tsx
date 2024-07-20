import { useState, useEffect } from "react";
import RoomList from "@/components/room-list";
import GameSketch from "@/views/game-sketch";
import { useGameContext } from "@/context/game.context";
import logo from "@/assets/logo.png";
import styles from "./home.module.scss";

const Home: React.FC = () => {
  const [displayGameSketch, setDisplayGameSketch] = useState(false);
  const { currentLobby } = useGameContext();

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDisplayGameSketch(!!currentLobby);
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [currentLobby]);

  if (displayGameSketch) {
    return <GameSketch />;
  }

  return (
    <div className={styles.home}>
      <img src={logo} alt="Fuseball logo" className={styles.logo} />

      <p className={styles.description}>
        Fuseball is a casual browser based multiplayer football game where you
        can compete with your friends or other players from all over the world!
      </p>

      <RoomList />
    </div>
  );
};

export default Home;
