import React from "react";
import styles from "./game-overlay.module.scss";
import useCheckMobileScreen from "@/hooks/use-check-mobile";
import rotation from "@/assets/rotation.png";
import useCheckHorizontal from "@/hooks/use-check-horizontal";

const TurnPhoneHorizontal: React.FC = () => {
  const isMobile = useCheckMobileScreen();
  const isHorizontal = useCheckHorizontal();

  if (!isMobile || isHorizontal) {
    return null;
  }

  return (
    <div className={styles.game__overlay__turn__phone__horizontal}>
      <img src={rotation} alt="Turn your phone" />

      <h4>Turn your phone!</h4>
      <p>
        To fully enjoy the game, please turn your phone into the horizontal
        position!
      </p>

      <div
        className={styles.game__overlay__turn__phone__horizontal__attribution}
      >
        <a
          href="https://www.flaticon.com/free-icons/ui"
          target="_blank"
          rel="noopener noreferrer"
          title="ui icons"
        >
          Ui icons created by Radhe Icon - Flaticon
        </a>
      </div>
    </div>
  );
};

export default TurnPhoneHorizontal;
