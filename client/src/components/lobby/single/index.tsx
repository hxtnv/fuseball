import { useMemo, useState, useEffect } from "react";
import { useGameContext, Lobby, LobbyPlayer } from "@/context/game.context";
import styles from "./lobby-single.module.scss";
import EMOJIS from "@/lib/const/emojis";
import ChevronRight from "@/assets/icons/chevron-right-solid.svg?react";
import Plus from "@/assets/icons/plus-solid.svg?react";
import Sword from "@/assets/icons/sword-fill.svg?react";
import LOBBY_STATUS from "@/lib/const/lobby-status";
import useModal from "@/hooks/use-modal/use-modal";
import emitter from "@/lib/emitter";

const SingleRoom: React.FC<Lobby> = ({
  id,
  status,
  name,
  players,
  teamSize,
  countryCode,
  score,
}) => {
  const [error, setError] = useState<string>("fewfwe");
  const { joinLobby } = useGameContext();
  const { Modal, open } = useModal();

  const renderPlayer = (player: LobbyPlayer, index: number, team: number) => {
    if (player) {
      return (
        <div className={styles.room__player} key={index}>
          <p>{EMOJIS[player.emoji]}</p>
        </div>
      );
    }

    return (
      <div
        className={styles.room__player__empty}
        key={index}
        onClick={() => joinLobby(id, team)}
      >
        <Plus />
      </div>
    );
  };

  const teams = useMemo(() => {
    const team1 = players.filter((player) => player.team === 0);
    const team2 = players.filter((player) => player.team === 1);

    return [
      Array.from({ length: teamSize }).map((_, index) => team1[index]),
      Array.from({ length: teamSize }).map((_, index) => team2[index]),
    ];
  }, [teamSize, players]);

  const maxPlayers = teamSize * 2;

  const onJoinError = ({ data }: { data: string }) => {
    setError(data);
    open();
  };

  useEffect(() => {
    emitter.on("ws:message:join-lobby-error", onJoinError);

    return () => {
      emitter.off("ws:message:join-lobby-error", onJoinError);
    };
  }, []);

  return (
    <>
      <div className={styles.room}>
        <div className={styles.room__header}>
          <img src={`https://flagsapi.com/${countryCode}/shiny/32.png`} />
          <p>{name}</p>
          <span>&#40;{maxPlayers - players.length} spots available&#41;</span>

          <span
            className={styles.status}
            style={{ color: LOBBY_STATUS[status].color }}
          >
            {LOBBY_STATUS[status].text}
            {status === "in-progress" ? ` (${score.join(" : ")})` : ""}
          </span>
        </div>

        <div className={styles.room__players}>
          {teams[0].map((player, index) => renderPlayer(player, index, 0))}
          <Sword className={styles.room__player__sword} />
          {teams[1].map((player, index) => renderPlayer(player, index, 1))}

          <div className={styles.room__join} onClick={() => joinLobby(id)}>
            <p>Join</p>
            <ChevronRight />
          </div>
        </div>
      </div>

      <Modal title="Failed to join lobby">
        <p style={{ textAlign: "center", margin: "20px 0" }}>{error}</p>
      </Modal>
    </>
  );
};

export default SingleRoom;
