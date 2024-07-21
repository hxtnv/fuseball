import WebSocket from "ws";
import { handleMessage } from "./message-handler";
import { broadcast, send } from "../lib/utils";
import lobbyManager from "../lib/lobby-manager";

type WebSocketClient = WebSocket & { id: string };

export const handleConnection = (
  ws: WebSocketClient,
  wss: WebSocket.Server
) => {
  send(ws, "user-id", ws.id);
  broadcast(wss, "players-online", wss.clients.size);

  ws.on("message", (message: string) => {
    handleMessage(message, ws, wss);
  });

  ws.on("close", () => {
    lobbyManager.removeClientFromLobbies(ws.id);

    broadcast(wss, "lobbies", lobbyManager.getAll());
    broadcast(wss, "players-online", wss.clients.size);
  });
};
