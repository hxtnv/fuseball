import { useEffect, useState } from "react";
import styles from "./overlay.module.scss";
import classNames from "classnames";
import GAME from "shared/lib/const/game";
import useGameServerContext from "@/hooks/context/use-game-server";
import type { LobbyGoalAnnouncement } from "shared/types/game";

const GoalAnnouncement = () => {
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState<LobbyGoalAnnouncement | null>(null);
  const { webSocket } = useGameServerContext();

  const classes = classNames(styles.overlay__goal, {
    [styles.visible]: visible,
  });

  useEffect(() => {
    if (!webSocket) {
      return;
    }

    const unsubscribe = webSocket.subscribe<LobbyGoalAnnouncement>(
      "goal",
      (data) => {
        setData(data);
        setVisible(true);
      }
    );

    const unsubscribeRoundReset = webSocket.subscribe<LobbyGoalAnnouncement>(
      "round-reset",
      () => {
        setVisible(false);
      }
    );

    return () => {
      unsubscribe();
      unsubscribeRoundReset();
    };
  }, [webSocket]);

  return (
    <div className={classes}>
      <p>
        <span
          style={{
            color:
              GAME.TEAM_COLORS[data?.teamIndex ?? 0] ?? GAME.TEAM_COLORS[0],
          }}
        >
          {data?.teams[data?.teamIndex ?? 0]?.displayName ?? "Unknown team"}
        </span>{" "}
        scored a goal!
      </p>
    </div>
  );
};

export default GoalAnnouncement;
