import { createServer } from "./websocket-server";

const port = process.env.PORT || 8080;
const wss = createServer(Number(port));
