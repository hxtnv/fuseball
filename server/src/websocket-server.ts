import WebSocket from "ws";
import { randomUUID } from "crypto";
import { handleConnection } from "./handlers/connection-handler";
import lobbyManager from "./lib/lobby-manager";
import { broadcast } from "./lib/utils";

type WebSocketClient = WebSocket & { id: string };

export const createServer = (port: number): WebSocket.Server => {
  const wss = new WebSocket.Server({ port });

  wss.on("connection", (ws: WebSocketClient) => {
    ws.id = randomUUID();
    handleConnection(ws, wss);
  });

  // todo: move this to a separate worker / cluster
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

      broadcast(
        wss,
        "lobby-live-update",
        lobby,
        lobby.players.map((player) => player.id) // only send to players in the lobby
      );
    });
  }, 1000 / 30);

  return wss;
};
