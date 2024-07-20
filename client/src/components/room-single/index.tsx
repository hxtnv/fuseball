import { useMemo } from "react";
import { useGameContext, Lobby, LobbyPlayer } from "@/context/game.context";
import styles from "./room-single.module.scss";
import EMOJIS from "@/lib/const/emojis";
import ChevronRight from "@/assets/icons/chevron-right-solid.svg?react";
import Plus from "@/assets/icons/plus-solid.svg?react";
import Sword from "@/assets/icons/sword-fill.svg?react";

const lobbyStatus: Record<
  Lobby["status"],
  {
    text: string;
    color: string;
  }
> = {
  warmup: {
    text: "Warmup",
    color: "#6ae72c",
  },
  "in-progress": {
    text: "In progress",
    color: "#e7a62c",
  },
  finished: {
    text: "Finished",
    color: "#f31f1f",
  },
};

const SingleRoom: React.FC<Lobby> = ({
  // id,
  status,
  name,
  players,
  teamSize,
  countryCode,
  score,
}) => {
  const maxPlayers = teamSize * 2;
  const { setView } = useGameContext();

  const renderPlayer = (player: LobbyPlayer, index: number) => {
    if (player) {
      return (
        <div className={styles.room__player} key={index}>
          <p>{EMOJIS[player.emoji]}</p>
        </div>
      );
    }

    return (
      <div className={styles.room__player__empty} key={index}>
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

  console.log(teams);

  return (
    <div className={styles.room}>
      <div className={styles.room__header}>
        <img src={`https://flagsapi.com/${countryCode}/shiny/64.png`} />
        <p>{name}</p>
        <span>&#40;{maxPlayers - players.length} spots available&#41;</span>

        <span
          className={styles.status}
          style={{ color: lobbyStatus[status].color }}
        >
          {lobbyStatus[status].text}
          {status === "in-progress" && score ? ` (${score})` : ""}
        </span>
      </div>

      <div className={styles.room__players}>
        {teams[0].map(renderPlayer)}
        <Sword className={styles.room__player__sword} />
        {teams[1].map(renderPlayer)}

        <div className={styles.room__join} onClick={() => setView("game")}>
          <p>Join</p>
          <ChevronRight />
        </div>
      </div>
    </div>
  );
};

export default SingleRoom;
