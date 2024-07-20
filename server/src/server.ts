import WebSocket from "ws";
import { randomUUID } from "crypto";
import lobbyManager from "./lib/lobby-manager";

type WebSocketClient = WebSocket & { id: string };

const wss = new WebSocket.Server({ port: 8080 });

wss.on("connection", (ws: WebSocketClient) => {
  ws.id = randomUUID();

  const send = (event: string, data: any) => {
    ws.send(JSON.stringify({ event, data }));
  };

  const broadcast = (event: string, data: any) => {
    wss.clients.forEach(function each(client) {
      client.send(JSON.stringify({ event, data }));
    });
  };

  send("user-id", ws.id);

  ws.on("message", (message: string) => {
    try {
      const parsedMessage = JSON.parse(message);

      console.log("got message", parsedMessage);

      if (parsedMessage.event === "get-lobbies") {
        send("lobbies", lobbyManager.getAll());
      } else if (parsedMessage.event === "create-lobby") {
        const { lobby, error } = lobbyManager.create(parsedMessage.data, ws.id);

        if (error) {
          send("create-lobby-error", error);
        }

        if (lobby) {
          send("create-lobby-success", lobby);
          broadcast("lobbies", lobbyManager.getAll());
        }
      } else {
        send("error", "Unknown event");
      }
    } catch (error) {
      send("error", "Invalid message format");
    }
  });

  ws.on("close", () => {
    lobbyManager.removeClientLobbies(ws.id);
  });
});

console.log("WebSocket server is running on ws://localhost:8080");
