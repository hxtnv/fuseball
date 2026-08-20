import PlayCTA from "@/views/home/components/play-cta";
import styles from "./home.module.scss";
import PlayerPreview from "@/views/home/components/player-preview";
import Socials from "@/views/home/components/socials";
import ServerPicker from "@/views/home/components/server-picker";

const Home: React.FC = () => {
  return (
    <div className={styles.home}>
      <div className={styles.home__layout}>
        <div className={styles.home__layout__column}>
          <PlayerPreview />
          <ServerPicker />
          <Socials />
        </div>

        <div className={styles.home__layout__column}>
          <PlayCTA />
        </div>
      </div>
    </div>
  );
};

export default Home;
