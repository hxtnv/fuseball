import styles from "./sign-in.module.scss";
import { useEffect, useMemo, useState, useRef } from "react";
import config from "@/config";
import Button from "@/components/common/button";
import popupCenter from "@/lib/helpers/popup-center";
import Google from "@/assets/icons/google-brands-solid.svg?react";
import Discord from "@/assets/icons/discord-brands-solid.svg?react";
import { useWebSocket } from "@/context/websocket.context";

type Props = {
  open: () => void;
  close: () => void;
};

const SignInModal: React.FC<Props> = ({ close: closeModal }) => {
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const windowRef = useRef<Window | null>(null);

  const { sendHandshake, playerData } = useWebSocket();

  const signIn = (provider: string) => {
    setLoading({ ...loading, [provider]: true });

    // todo: reset after closing window (when cancelling)
    windowRef.current = window.open(
      config.apiUrl + `/auth/${provider}`,
      "_blank",
      popupCenter()
    );

    windowRef.current?.focus();
  };

  const disableOtherOptions = useMemo(() => {
    return Object.values(loading).includes(true);
  }, [loading]);

  useEffect(() => {
    if (playerData?.authenticated) {
      closeModal();
    }
  }, [playerData]);

  useEffect(() => {
    const broadcast = new BroadcastChannel("fuseball-auth");

    broadcast.onmessage = (event) => {
      sendHandshake(event.data);
      windowRef.current?.close();
    };

    return () => {
      broadcast.close();
    };
  }, []);

  return (
    <div className={styles.modal}>
      <div className={styles.modal__content}>
        <h4>Welcome!</h4>
        <p>
          Signing in will allow you to unlock additional features, like
          statistics, competing in the leaderboard, customizing your character
          and more.
        </p>

        <p>Continue with one of the following options:</p>

        <div className={styles.modal__content__socials}>
          <Button
            variant="secondary"
            onClick={() => signIn("google")}
            loading={loading.google}
            disabled={disableOtherOptions}
          >
            <Google />
            <span>Sign in with Google</span>
          </Button>

          <Button
            variant="secondary"
            onClick={() => signIn("discord")}
            loading={loading.discord}
            disabled={disableOtherOptions}
          >
            <Discord />
            <span>Sign in with Discord</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SignInModal;
