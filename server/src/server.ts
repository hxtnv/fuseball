import { createServer } from "./websocket-server";

const wss = createServer(8080);

console.log("WebSocket server is running on ws://localhost:8080");
