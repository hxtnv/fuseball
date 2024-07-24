import { useEffect, useState } from "react";
import styles from "./game-overlay.module.scss";
import type { LobbyLive } from "@/context/game.context";
import emitter from "@/lib/emitter";

const MessageBox: React.FC = () => {
  const [visibility, setVisibility] = useState<
    "hidden" | "visible" | "halfway-out"
  >("hidden");

  const onLobbyLiveUpdate = ({ data }: { data: LobbyLive }) => {
    setVisibility(data.status === "warmup" ? "visible" : "halfway-out");
    // setVisibility(data.players.length <= 1 ? "visible" : "halfway-out");
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (visibility === "halfway-out") setVisibility("hidden");
    }, 300);

    return () => {
      clearTimeout(timeout);
    };
  }, [visibility]);

  useEffect(() => {
    emitter.on("ws:message:lobby-live-update", onLobbyLiveUpdate);

    return () => {
      emitter.off("ws:message:lobby-live-update", onLobbyLiveUpdate);
    };
  }, []);

  if (visibility === "hidden") return null;

  return (
    <div
      className={styles.game__overlay__waiting__notice}
      data-visibility={visibility}
    >
      <div className={styles.game__overlay__waiting__notice__content}>
        <h4>Waiting for players...</h4>
        <p>The game will start when two or more players join.</p>
      </div>
    </div>
  );
};

export default MessageBox;
