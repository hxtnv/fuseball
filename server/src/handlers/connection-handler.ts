import WebSocket from "ws";
import { handleMessage } from "./message-handler";
import lobbyManager from "../lib/lobby-manager";
import { WebSocketClient } from "../types/ws";

export const handleConnection = (
  ws: WebSocketClient,
  wss: WebSocket.Server
) => {
  ws.on("message", async (message: string) => {
    handleMessage(message, ws, wss);
  });

  ws.on("close", () => {
    if (!ws.playerData) return;

    console.log(
      `Player "${ws.playerData.name}" from "${ws.playerData.timezone}" has disconnected`
    );

    lobbyManager.removeClient(ws.playerData);
  });
};
