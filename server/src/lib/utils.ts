import WebSocket from "ws";

type WebSocketClient = WebSocket & { id: string };

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
    if (playerIds && !playerIds.includes((client as WebSocketClient).id)) {
      return;
    }

    console.log("broadcasting to", (client as WebSocketClient).id);
    client.send(JSON.stringify({ event, data }));
  });
};
