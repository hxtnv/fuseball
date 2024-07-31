import fs from "fs";
import https from "https";
import http from "http";
import WebSocket from "ws";
import { handleConnection } from "./handlers/connection-handler";
import gameLoop from "./lib/game-loop";
import { setWss } from "./lib/lobby-manager/state";
import { WebSocketClient } from "./types/ws";

export const createServer = (port: number): WebSocket.Server => {
  const isProd = process.env.NODE_ENV === "production";

  const serverOptions = isProd
    ? {
        key: fs.readFileSync("./.ssl/privkey.pem"),
        cert: fs.readFileSync("./.ssl/fullchain.pem"),
      }
    : {};

  const createServerCallback = (req: any, res: any) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Fuseball API\n");
  };

  const server = isProd
    ? https.createServer(serverOptions, createServerCallback)
    : http.createServer(createServerCallback);

  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws: WebSocketClient) => {
    handleConnection(ws, wss);
  });

  gameLoop(wss);
  setWss(wss);

  server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });

  return wss;
};
