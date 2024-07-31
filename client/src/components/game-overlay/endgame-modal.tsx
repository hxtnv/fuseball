import { useEffect, useState } from "react";
import styles from "./game-overlay.module.scss";
import { useGameContext, type LobbyLive } from "@/context/game.context";
import emitter from "@/lib/emitter";
import useModal from "@/hooks/use-modal/use-modal";
import TEAM_COLORS from "@/lib/const/team-colors";
import { useWebSocket } from "@/context/websocket.context";

type DisplayData = {
  didWeWin: boolean;
  score: number[];
  isDraw: boolean;
  ourTeam: number;
};

const EndGameModal: React.FC = () => {
  const [data, setData] = useState<DisplayData>({
    didWeWin: false,
    score: [0, 0],
    ourTeam: 0,
    isDraw: false,
  });

  const onConfirm = () => {
    close();
    setCurrentLobby(null);
  };

  const { open, close, Modal } = useModal();
  const { setCurrentLobby } = useGameContext();
  const { playerData } = useWebSocket();

  const onLobbyLiveUpdate = ({ data }: { data: LobbyLive }) => {
    if (data.status !== "finished") return;

    const ourTeam = data.players.find(
      (player) => player.id == playerData.id
    )?.team;

    if (ourTeam === undefined) return;

    setData({
      didWeWin: data.score[ourTeam] > data.score[ourTeam === 0 ? 1 : 0],
      score: data.score,
      ourTeam,
      isDraw: data.score[0] === data.score[1],
    });
    open();
  };

  useEffect(() => {
    emitter.on("ws:message:lobby-live-update", onLobbyLiveUpdate);

    return () => {
      emitter.off("ws:message:lobby-live-update", onLobbyLiveUpdate);
    };
  }, [playerData.id]);

  return (
    <Modal
      showFooter
      hideCancelButton
      hideCloseButton
      confirmText="Go home"
      onConfirm={onConfirm}
    >
      <div className={styles.game__overlay__endgame__modal}>
        <h3
          style={{
            color: data.didWeWin || data.isDraw ? "#2cb580" : "#f31f1f",
          }}
        >
          {data.isDraw
            ? "It's a draw"
            : data.didWeWin
            ? "You won!"
            : "You lost"}
        </h3>

        <p>
          Your team has scored{" "}
          <span>
            {data.score[data.ourTeam]} goal
            {data.score[data.ourTeam] === 1 ? "" : "s"}
          </span>{" "}
          and the final score was
        </p>

        <div className={styles.game__overlay__endgame__modal__score}>
          <span style={{ color: TEAM_COLORS[0] }}>{data.score[0]}</span>
          <span> : </span>
          <span style={{ color: TEAM_COLORS[1] }}>{data.score[1]}</span>
        </div>
      </div>
    </Modal>
  );
};

export default EndGameModal;
