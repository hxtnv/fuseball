import WebSocket from "ws";

export type LobbyPlayer = {
  id: string;
  name: string;
  emoji: number;
  team: 0 | 1;
};

export type Lobby = {
  id: string;
  status: "warmup" | "in-progress" | "finished";
  name: string;
  players: LobbyPlayer[];
  teamSize: number;
  countryCode: string;
  score?: string;
};

const lobbies: Lobby[] = [
  {
    id: "1",
    status: "warmup",
    name: "Deutsche Fußball",
    players: [
      {
        id: "1",
        name: "Player 1",
        emoji: 0,
        team: 0,
      },
    ],
    teamSize: 2,
    countryCode: "DE",
  },
  {
    id: "2",
    status: "warmup",
    name: "POLSKA PRZEJMUJE TEN SERWER",
    players: [
      {
        id: "1",
        name: "Player 1",
        emoji: 5,
        team: 1,
      },
      {
        id: "1",
        name: "Player 1",
        emoji: 7,
        team: 0,
      },
    ],
    teamSize: 4,
    countryCode: "PL",
  },
];

// Create WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (message: string) => {
    try {
      const parsedMessage = JSON.parse(message);

      console.log("got message", parsedMessage);

      if (parsedMessage.event === "get-lobbies") {
        ws.send(JSON.stringify({ event: "lobbies", data: lobbies }));
      } else {
        ws.send(JSON.stringify({ event: "error", message: "Unknown event" }));
      }
    } catch (error) {
      ws.send(
        JSON.stringify({ event: "error", message: "Invalid message format" })
      );
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

console.log("WebSocket server is running on ws://localhost:8080");
