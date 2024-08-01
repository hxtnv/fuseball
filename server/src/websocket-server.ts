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
import supabase from "./lib/supabase";

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

  app.get("/", (req, res) => {
    res.send("Fuseball API");
  });

  app.get("/news", async (req, res) => {
    const { data, error } = await supabase
      .from("news")
      .select()
      .order("id", { ascending: false });

    res.json(data);
  });

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
