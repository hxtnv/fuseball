import WebSocket from "ws";
import lobbyManager from "./lobby-manager";
import { broadcast } from "./utils";

import updatePlayerPositions from "./lobby-manager/game-loop/update-player-positions";
import updateChatMsgs from "./lobby-manager/game-loop/update-chat-msgs";
import checkForGoals from "./lobby-manager/game-loop/check-for-goals";
import updateTimer from "./lobby-manager/game-loop/update-timer";
import updateRoundStatus from "./lobby-manager/game-loop/update-round-status";

const gameLoop = (wss: WebSocket.Server) => {
  setInterval(() => {
    Object.values(lobbyManager.getAllLive()).forEach((lobby) => {
      updatePlayerPositions(lobby);
      updateChatMsgs(lobby);
      checkForGoals(lobby, wss);

      // broadcast updates to players in the lobby
      broadcast(
        wss,
        "lobby-live-update",
        lobby,
        lobby.players.map((player) => player.id)
      );
    });
  }, 1000 / 30);

  setInterval(() => {
    Object.values(lobbyManager.getAllLive()).forEach((lobby) => {
      updateTimer(lobby, wss);
      updateRoundStatus(lobby, wss);
    });
  }, 1000);
};

export default gameLoop;
