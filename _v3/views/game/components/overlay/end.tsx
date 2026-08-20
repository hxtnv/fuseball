import { useEffect, useState } from "react";
import styles from "./overlay.module.scss";
import classNames from "classnames";
import GAME from "shared/lib/const/game";
import useGameServerContext from "@/hooks/context/use-game-server";
import type { LobbyEndAnnouncement } from "shared/types/game";
import Button from "@/components/common/button";
import useGameContext from "@/hooks/context/use-game";
import useApiQuery from "@/hooks/use-api-query";
import { useMemo } from "react";
import type { PlayResponse } from "shared/types/api";
import { useNavigate } from "react-router-dom";

const EndGame = () => {
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState<LobbyEndAnnouncement | null>(null);
  const { webSocket } = useGameServerContext();

  const { partyType, partyId } = useGameContext();
  const { selectedServer } = useGameServerContext();

  const navigate = useNavigate();

  const gameServerUrl = useMemo(() => {
    return selectedServer?.http ?? "";
  }, [selectedServer]);

  const { refetch: leave, isLoading: leaveLoading } = useApiQuery<PlayResponse>(
    `${gameServerUrl}/leave`,
    {
      enabled: false,
      method: "POST",
      onSuccess: () => {
        navigate("/");
      },
    }
  );

  const { refetch: playAgain, isLoading: playAgainLoading } =
    useApiQuery<PlayResponse>(`${gameServerUrl}/leave`, {
      enabled: false,
      method: "POST",
      onSuccess: () => {
        navigate(
          partyType === "party"
            ? `/${partyType}/${partyId}`
            : `/play/${partyType}`
        );
      },
    });

  const classes = classNames(styles.overlay__end, {
    [styles.visible]: visible,
  });

  useEffect(() => {
    if (!webSocket) {
      return;
    }

    const unsubscribe = webSocket.subscribe<LobbyEndAnnouncement>(
      "gameEnded",
      (data) => {
        setData(data);
        setVisible(true);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [webSocket]);

  return (
    <div className={classes}>
      {visible && (
        <>
          <h4 className={styles.overlay__end__title}>Game Over</h4>
          <h3
            className={styles.overlay__end__team}
            style={{ color: GAME.TEAM_COLORS[data?.winningTeamIndex ?? 0] }}
          >
            {data?.winningTeam
              ? `${data?.winningTeam?.displayName} wins!`
              : "It's a draw!"}
          </h3>

          <p className={styles.overlay__end__score}>
            {data?.score.join(" - ")}
          </p>

          <div className={styles.overlay__end__buttons}>
            <Button
              size="medium"
              onClick={playAgain}
              loading={playAgainLoading}
            >
              Play Again
            </Button>
            <Button
              size="medium"
              variant="secondary"
              loading={leaveLoading}
              onClick={leave}
            >
              Back to menu
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default EndGame;
