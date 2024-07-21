import WebSocket from "ws";
import { broadcast, send } from "../lib/utils";
import lobbyManager from "../lib/lobby-manager";

type WebSocketClient = WebSocket & { id: string };

export const handleMessage = (
  message: string,
  ws: WebSocketClient,
  wss: WebSocket.Server
) => {
  try {
    const parsedMessage = JSON.parse(message);

    if (parsedMessage.event !== "ping") {
      console.log("got message", parsedMessage);
    }

    switch (parsedMessage.event) {
      case "get-lobbies":
        send(ws, "lobbies", lobbyManager.getAll());
        break;

      case "create-lobby":
        handleCreateLobby(parsedMessage.data, ws, wss);
        break;

      case "join-lobby":
        handleJoinLobby(parsedMessage.data, ws, wss);
        break;

      case "ping":
        send(ws, "pong");
        break;

      default:
        send(ws, "error", "Unknown event");
        break;
    }
  } catch (error) {
    send(ws, "error", "Invalid message format");
  }
};

const handleCreateLobby = (
  data: any,
  ws: WebSocketClient,
  wss: WebSocket.Server
) => {
  const { lobby, error } = lobbyManager.create(data, ws.id);

  if (error) {
    send(ws, "create-lobby-error", error);
    return;
  }

  if (lobby) {
    send(ws, "create-lobby-success", lobby);
    broadcast(wss, "lobbies", lobbyManager.getAll());
  }
};

const handleJoinLobby = (
  data: any,
  ws: WebSocketClient,
  wss: WebSocket.Server
) => {
  const { lobby, error } = lobbyManager.join(data, ws.id);

  if (error) {
    send(ws, "join-lobby-error", error);
    return;
  }

  if (lobby) {
    send(ws, "join-lobby-success", lobby);
    broadcast(wss, "lobbies", lobbyManager.getAll());
  }
};
