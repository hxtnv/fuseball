import { useEffect, useState } from "react";
import LeaveButton from "./leave-button";
import MessageBox from "./message-box";
import emitter from "@/lib/emitter";
import styles from "./game-overlay.module.scss";

const GameOverlay: React.FC = () => {
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

    return () => {
      emitter.off("game:chat-input-focus-start", onInputFocusStart);
      emitter.off("game:chat-input-focus-end", onInputFocusEnd);
    };
  }, []);
  return (
    <div className={styles.game__overlay}>
      <LeaveButton inputFocus={inputFocus} />
      <MessageBox inputFocus={inputFocus} />
    </div>
  );
};

export default GameOverlay;
