import WebSocket from "ws";
import { broadcast, send } from "../lib/utils";
import lobbyManager from "../lib/lobby-manager";

type WebSocketClient = WebSocket & { id: string };

type PlayerMove = {
  direction: "up" | "down" | "left" | "right";
};

export const handleMessage = (
  message: string,
  ws: WebSocketClient,
  wss: WebSocket.Server
) => {
  try {
    const parsedMessage = JSON.parse(message);

    if (
      parsedMessage.event !== "ping" &&
      parsedMessage.event !== "player-move-start" &&
      parsedMessage.event !== "player-move-end"
    ) {
      console.log("got message", parsedMessage);
    }

    switch (parsedMessage.event) {
      case "get-lobbies":
        send(ws, "lobbies", lobbyManager.getAll());
        break;

      case "create-lobby":
        handleCreateLobby(parsedMessage.data, ws, wss);
        break;

      case "leave-lobby":
        handleLeaveLobby(ws, wss);
        break;

      case "join-lobby":
        handleJoinLobby(parsedMessage.data, ws, wss);
        break;

      case "player-move-start":
        handlePlayerMoveStart(parsedMessage.data, ws, wss);
        break;

      case "player-move-end":
        handlePlayerMoveEnd(parsedMessage.data, ws, wss);
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

const handlePlayerMoveStart = (
  data: PlayerMove,
  ws: WebSocketClient,
  wss: WebSocket.Server
) => {
  if (typeof data !== "object" || Array.isArray(data) || !data?.direction) {
    return;
  }

  lobbyManager.playerMoveStart(data.direction, ws.id);
};

const handlePlayerMoveEnd = (
  data: PlayerMove,
  ws: WebSocketClient,
  wss: WebSocket.Server
) => {
  if (typeof data !== "object" || Array.isArray(data) || !data?.direction) {
    return;
  }

  lobbyManager.playerMoveEnd(data.direction, ws.id);
};

const handleCreateLobby = (
  data: any, // todo: fix types
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
  data: any, // todo: fix types
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

const handleLeaveLobby = (ws: WebSocketClient, wss: WebSocket.Server) => {
  lobbyManager.removeClientFromLobbies(ws.id);

  broadcast(wss, "lobbies", lobbyManager.getAll());
};
