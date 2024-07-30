import WebSocket from "ws";
import type { WebSocketClient } from "../types/ws";

export const send = (ws: WebSocketClient, event: string, data?: any) => {
  ws.send(JSON.stringify({ event, data }));
};

export const broadcast = (
  wss: WebSocket.Server,
  event: string,
  data: any,
  playerIds?: string[]
) => {
  wss.clients.forEach(function each(client) {
    if (playerIds) {
      if (!playerIds.includes((client as WebSocketClient).playerData?.id)) {
        return;
      }
    }

    client.send(JSON.stringify({ event, data }));
  });
};
