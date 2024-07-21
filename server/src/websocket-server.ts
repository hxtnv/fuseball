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

  // test
  setInterval(() => {
    Object.values(lobbyManager.getAllLive()).forEach((lobby) => {
      broadcast(
        wss,
        "lobby-live-update",
        lobby,
        lobby.players.map((player) => player.id)
      );
    });
  }, 1000 / 1);
  // end test

  return wss;
};
