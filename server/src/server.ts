import { createServer } from "./websocket-server";

// Keep the process alive when a stray promise rejects or an error escapes a
// handler (e.g. transient DB errors) instead of crashing the whole server.
process.on("unhandledRejection", (reason) => {
  console.error("[unhandledRejection]", reason);
});

process.on("uncaughtException", (err) => {
  console.error("[uncaughtException]", err);
});

const port = process.env.PORT || 8080;
const wss = createServer(Number(port));
