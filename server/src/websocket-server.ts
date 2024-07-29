import fs from "fs";
import https from "https";
import WebSocket from "ws";
import { randomUUID } from "crypto";
import { handleConnection } from "./handlers/connection-handler";
import gameLoop from "./lib/game-loop";
import { setWss } from "./lib/lobby-manager/state";

type WebSocketClient = WebSocket & { id: string };

const createServerDev = (port: number): WebSocket.Server => {
  const wss = new WebSocket.Server({ port });

  wss.on("connection", (ws: WebSocketClient) => {
    ws.id = randomUUID();
    handleConnection(ws, wss);
  });

  gameLoop(wss);
  setWss(wss);

  console.log(`WebSocket server is running on ws://localhost:${port}`);

  return wss;
};

const createServerProd = (port: number): WebSocket.Server => {
  const serverOptions = {
    key: fs.readFileSync("./.ssl/privkey.pem"),
    cert: fs.readFileSync("./.ssl/fullchain.pem"),
  };

  const server = https.createServer(serverOptions, (req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Fuseball API\n");
  });

  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws: WebSocketClient) => {
    ws.id = randomUUID();
    handleConnection(ws, wss);
  });

  gameLoop(wss);
  setWss(wss);

  server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });

  return wss;
};

export const createServer =
  process.env.NODE_ENV === "production" ? createServerProd : createServerDev;
