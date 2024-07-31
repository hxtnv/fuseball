import { useEffect } from "react";
import config from "@/config";
import emitter from "@/lib/emitter";
import type { WebSocketContextType } from "@/context/websocket.context";

const usePing = (
  ws: WebSocketContextType["ws"],
  status: WebSocketContextType["status"]
) => {
  const measurePing = () => {
    if (!ws) {
      return;
    }

    const pingTimestamp = Date.now();
    ws.send(JSON.stringify({ event: "ping" }));

    const onPongReceived = () => {
      const roundTripTime = Date.now() - pingTimestamp;

      emitter.emit("game:ping", roundTripTime);
      emitter.off("ws:message:pong", onPongReceived);
    };

    emitter.on("ws:message:pong", onPongReceived);
  };

  useEffect(() => {
    if (status === "connected") {
      measurePing();

      const interval = setInterval(measurePing, config.pingInterval);
      return () => clearInterval(interval);
    }
  }, [ws, status]);

  return null;
};

export default usePing;
