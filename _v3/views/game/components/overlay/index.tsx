import styles from "./overlay.module.scss";
import Leave from "./leave";
import Logo from "./logo";
import Reactions from "./reactions";
import GoalAnnouncement from "./goal";
import EndGame from "./end";

const Overlay = () => {
  return (
    <div className={styles.overlay}>
      <Leave />
      <Logo />
      <Reactions />
      <GoalAnnouncement />
      <EndGame />
    </div>
  );
};

export default Overlay;
