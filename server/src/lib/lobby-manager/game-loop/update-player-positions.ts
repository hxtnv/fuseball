import { LobbyLive } from "../../../types/lobby";
import lobbyManager from "../";

const updatePlayerPositions = (lobby: LobbyLive) => {
  lobby.players.forEach((player) => {
    lobbyManager.updatePlayerPosition({
      lobbyId: lobby.id,
      playerId: player.id,
    });
  });
};

export default updatePlayerPositions;
