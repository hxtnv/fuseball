import WebSocket from "ws";
import lobbyManager from "./lobby-manager";
import { broadcast } from "./utils";

import isInsideGoalZone from "./helpers/is-inside-goal-zone";
import BALL from "./const/ball";

const gameLoop = (wss: WebSocket.Server) => {
  setInterval(() => {
    const now = Date.now();

    Object.values(lobbyManager.getAllLive()).forEach((lobby) => {
      // todo: move this into something like a "game-loop" function

      // update player positions
      lobby.players.forEach((player) => {
        lobbyManager.updatePlayerPosition({
          lobbyId: lobby.id,
          playerId: player.id,
        });
      });

      // update chat messages
      Object.keys(lobby.chatMessages).forEach((playerId) => {
        const message = lobby.chatMessages[playerId];

        if (!message) {
          return;
        }

        if (now - message.timestamp > 5000) {
          delete lobby.chatMessages[playerId];
          return;
        }
      });

      // check ball position to adjust score
      const { isInside, whichTeamLost, whichTeamWon } = isInsideGoalZone(
        lobby.ball.position,
        BALL.SIZE
      );

      if (isInside && typeof whichTeamWon === "number") {
        lobbyManager.registerBallHit(lobby.id, whichTeamWon, () => {
          broadcast(wss, "lobbies", lobbyManager.getAll());
          broadcast(
            wss,
            "lobby-live-goal",
            {
              whichTeam: whichTeamWon,
            },
            lobby.players.map((player) => player.id)
          );
        });
      }

      broadcast(
        wss,
        "lobby-live-update",
        lobby,
        lobby.players.map((player) => player.id) // only send to players in the lobby
      );
    });
  }, 1000 / 30);

  setInterval(() => {
    const now = Date.now();

    Object.values(lobbyManager.getAllLive()).forEach((lobby) => {
      if (lobby.status === "in-progress") {
        lobby.timeLeft -= 1;

        if (lobby.timeLeft <= 0) {
          lobbyManager.updateStatus(lobby.id, {
            status: "finished",
          });

          broadcast(wss, "lobbies", lobbyManager.getAll());
        }
      }
    });
  }, 1000);
};

export default gameLoop;
