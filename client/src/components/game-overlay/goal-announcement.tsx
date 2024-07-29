import { Fragment, useState, useEffect } from "react";
import styles from "./game-overlay.module.scss";
import emitter from "@/lib/emitter";
import TEAM_COLORS from "@/lib/const/team-colors";
import TEAM_NAMES from "@/lib/const/team-names";

type GoalType = {
  data: {
    whichTeam: number;
  };
};

const GoalAnnouncement: React.FC = () => {
  const [visible, setVisible] = useState<boolean>(false);
  const [team, setTeam] = useState<number>(0);

  const onGoalAnnouncement = ({ data }: GoalType) => {
    setTeam(data.whichTeam);
    setVisible(true);
  };

  useEffect(() => {
    emitter.on("ws:message:lobby-live-goal", onGoalAnnouncement);

    return () => {
      emitter.off("ws:message:lobby-live-goal", onGoalAnnouncement);
    };
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (visible) setVisible(false);
    }, 2500);

    return () => {
      clearTimeout(timeout);
    };
  }, [visible]);

  return (
    <Fragment>
      <div
        className={styles.game__overlay__goal__announcement}
        data-visible={visible || null}
      >
        <div className={styles.game__overlay__goal__announcement__background} />

        <div className={styles.game__overlay__goal__announcement__content}>
          <p>
            <span style={{ color: TEAM_COLORS[team] }}>
              Team {TEAM_NAMES[team]}
            </span>{" "}
            scored a goal!
          </p>
        </div>
      </div>
    </Fragment>
  );
};

export default GoalAnnouncement;
