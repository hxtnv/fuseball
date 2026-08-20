import { useEffect, Fragment, useState, useRef } from "react";
import styles from "./game-overlay.module.scss";
import emitter from "@/lib/emitter";
import useCheckMobileScreen from "@/hooks/use-check-mobile";

type Props = {
  inputFocus: boolean;
};

const MessageBox: React.FC<Props> = ({ inputFocus }) => {
  const [message, setMessage] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  const isMobile = useCheckMobileScreen();

  const getPlaceholderMessage = () => {
    if (isMobile) {
      return "Click here to open chat...";
    }

    return "Press T to start typing...";
  };

  const abandonMessage = () => {
    setMessage("");
    inputRef.current?.blur();
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      if (message.replace(/\s+/g, "") === "") {
        abandonMessage();
        return;
      }

      emitter.emit("ws:send", {
        event: "chat-message",
        data: {
          message,
        },
      });

      abandonMessage();
    } else if (event.key === "t") {
      inputRef.current?.focus();
    } else if (event.key === "Escape") {
      abandonMessage();
    }
  };

  const onInputFocus = () => {
    emitter.emit("game:chat-input-focus-start");
  };

  const onInputFocusOut = () => {
    emitter.emit("game:chat-input-focus-end");
  };

  useEffect(() => {
    window.addEventListener("keyup", onKeyDown);

    return () => {
      window.removeEventListener("keyup", onKeyDown);
    };
  }, [message]);

  useEffect(() => {
    inputRef.current?.addEventListener("focus", onInputFocus);
    inputRef.current?.addEventListener("focusout", onInputFocusOut);

    return () => {
      inputRef.current?.removeEventListener("focus", onInputFocus);
      inputRef.current?.removeEventListener("focusout", onInputFocusOut);
    };
  }, [inputRef]);

  return (
    <Fragment>
      <div className={styles.game__overlay__chat}>
        <div
          className={styles.game__overlay__chat__input}
          data-focus={inputFocus || null}
        >
          <input
            type="text"
            placeholder={
              inputFocus ? "Press Enter to send" : getPlaceholderMessage()
            }
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            ref={inputRef}
            maxLength={50}
            className="generic-box"
          />

          <p>
            Press <span>Escape</span> to close the chat
          </p>
        </div>
      </div>
    </Fragment>
  );
};

export default MessageBox;
