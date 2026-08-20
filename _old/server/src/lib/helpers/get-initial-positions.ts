import { LobbyPlayerLive } from "../../types/lobby";
import getInitialPosition from "./get-initial-position";

const getInitialPositions = (players: LobbyPlayerLive[]): LobbyPlayerLive[] => {
  const playersByTeams = [
    players.filter((player) => player.team === 0),
    players.filter((player) => player.team === 1),
  ];

  playersByTeams.forEach((players, index) => {
    players.forEach((player, index) => {
      player.position = getInitialPosition(index, player.team);
    });
  });

  return playersByTeams.flat();
};

export default getInitialPositions;
