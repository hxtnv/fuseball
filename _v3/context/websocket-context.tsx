import { createContext } from "react";
import type ReconnectingWebSocket from "reconnecting-websocket";

export const WebSocketContext = createContext<ReconnectingWebSocket | null>(
  null
);
