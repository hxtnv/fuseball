import LobbyList from "@/components/lobby/list";
import logo from "@/assets/logo.png";
import styles from "./home.module.scss";
import Footer from "@/components/domain/footer";
import PlayerPreview from "@/components/domain/player-preview";
import News from "@/components/domain/news";

const Home: React.FC = () => {
  return (
    <div className={styles.home}>
      <img src={logo} alt="Fuseball logo" className={styles.logo} />

      <div className={styles.home__layout}>
        <div className={styles.home__layout__column}>
          <News />
        </div>

        <div className={styles.home__layout__column}>
          <LobbyList />
        </div>

        <div className={styles.home__layout__column}>
          <PlayerPreview />
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Home;
