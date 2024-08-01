import LobbyList from "@/components/lobby/list";
import styles from "./home.module.scss";
import Footer from "@/components/domain/footer";
import PlayerPreview from "@/components/domain/player-preview";
import News from "@/components/domain/news";

const Home: React.FC = () => {
  return (
    <div className={styles.home}>
      <div className={styles.home__layout}>
        <div className={styles.home__layout__column}>
          <News />
          <Footer />
        </div>

        <div className={styles.home__layout__column}>
          <LobbyList />
        </div>

        <div className={styles.home__layout__column}>
          <PlayerPreview />
        </div>
      </div>
    </div>
  );
};

export default Home;
