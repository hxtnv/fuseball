import fs from "fs";
import https from "https";
import http from "http";
import WebSocket from "ws";
import cors from "cors";
import { handleConnection } from "./handlers/connection-handler";
import gameLoop from "./lib/game-loop";
import { setWss } from "./lib/lobby-manager/state";
import { WebSocketClient } from "./types/ws";
import express from "express";
import session from "express-session";
import dotenv from "dotenv";

import newsFeature from "./features/news";
import oauthFeature from "./features/oauth";
import selfFeature from "./features/self";

dotenv.config();

declare global {
  interface BigInt {
    toJSON: () => number | string;
  }
}

BigInt.prototype.toJSON = function () {
  const int = Number.parseInt(this.toString());
  return int ?? this.toString();
};

export const createServer = (port: number): WebSocket.Server => {
  const isProd = process.env.NODE_ENV === "production";

  const serverOptions = isProd
    ? {
        key: fs.readFileSync("./.ssl/privkey.pem"),
        cert: fs.readFileSync("./.ssl/fullchain.pem"),
      }
    : {};

  const app = express();

  app.use(cors());
  app.use(
    session({
      secret: process.env.SESSION_SECRET ?? "FUSEBALL_VERY_SECRET",
      resave: false,
      saveUninitialized: false,
    })
  );

  app.get("/", (req, res) => {
    res.send("Fuseball API");
  });

  app.use("/news", newsFeature);
  app.use("/auth", oauthFeature);
  app.use("/self", selfFeature);

  const server = isProd
    ? https.createServer(serverOptions, app)
    : http.createServer(app);

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
