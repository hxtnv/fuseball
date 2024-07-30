import { useEffect, useState } from "react";
import LeaveButton from "./leave-button";
import MessageBox from "./message-box";
import GoalAnnouncement from "./goal-announcement";
import WaitingNotice from "./waiting-notice";
import EndGameModal from "./endgame-modal";
import TurnPhoneHorizontal from "./turn-phone-horizontal";
import emitter from "@/lib/emitter";
import styles from "./game-overlay.module.scss";
import useCheckMobileScreen from "@/hooks/use-check-mobile";

const GameOverlay: React.FC = () => {
  const isMobile = useCheckMobileScreen();
  const [inputFocus, setInputFocus] = useState(false);

  const onInputFocusStart = () => {
    setInputFocus(true);
  };

  const onInputFocusEnd = () => {
    setInputFocus(false);
  };

  useEffect(() => {
    emitter.on("game:chat-input-focus-start", onInputFocusStart);
    emitter.on("game:chat-input-focus-end", onInputFocusEnd);

    if (isMobile) {
      document.documentElement.requestFullscreen();
    }

    return () => {
      emitter.off("game:chat-input-focus-start", onInputFocusStart);
      emitter.off("game:chat-input-focus-end", onInputFocusEnd);
    };
  }, [isMobile]);

  return (
    <div className={styles.game__overlay}>
      <LeaveButton inputFocus={inputFocus} />
      <MessageBox inputFocus={inputFocus} />
      <WaitingNotice />
      <GoalAnnouncement />
      <TurnPhoneHorizontal />
      <EndGameModal />
    </div>
  );
};

export default GameOverlay;
