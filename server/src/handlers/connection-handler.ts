import WebSocket from "ws";
import { handleMessage } from "./message-handler";
import lobbyManager from "../lib/lobby-manager";
import { WebSocketClient } from "../types/ws";
import { removeClient } from "../lib/lobby-manager/state";

export const handleConnection = (
  ws: WebSocketClient,
  wss: WebSocket.Server
) => {
  ws.on("message", (message: string) => {
    handleMessage(message, ws, wss);
  });

  ws.on("close", () => {
    // todo: combine these two functions
    console.log(
      `Player "${ws.playerData.name}" from "${ws.playerData.timezone}" has disconnected`
    );
    removeClient(ws.playerData);
    lobbyManager.removeClientFromLobbies(ws.playerData);
  });
};
