import WebSocket from "ws";
import type { PlayerData } from "./player";

export type WebSocketClient = WebSocket & { playerData: PlayerData };
