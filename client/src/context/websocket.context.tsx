import React, { useState, useEffect, useContext } from "react";
import emitter from "@/lib/emitter";
import config from "@/config";

type WebSocketContextType = {
  ws: WebSocket | null;
  status: "connecting" | "connected" | "disconnected" | "error";
};

const WebSocketContext = React.createContext<WebSocketContextType>({
  ws: null,
  status: "connecting",
});

const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [status, setStatus] =
    useState<WebSocketContextType["status"]>("connecting");

  const onEmitterSend = (event: string, data: any) => {
    if (!ws) {
      return;
    }

    console.log("sending event", event, data, !!ws);
    ws?.send(JSON.stringify({ event, data }));
  };

  useEffect(() => {
    emitter.on("ws:send", onEmitterSend);

    return () => {
      emitter.off("ws:send", onEmitterSend);
    };
  }, [ws, status]);

  useEffect(() => {
    const ws = new WebSocket(config.wsUrl);

    ws.onopen = () => {
      emitter.emit("ws:connected");
      setStatus("connected");
    };

    ws.onmessage = (event) => {
      const parsedMessage = JSON.parse(event.data);

      emitter.emit("ws:message", parsedMessage);
      emitter.emit(`ws:message:${parsedMessage.event}`, parsedMessage);
    };

    ws.onclose = () => {
      setStatus("disconnected");
      emitter.emit("ws:disconnected");
    };

    ws.onerror = (event: Event) => {
      setStatus("error");
      emitter.emit("ws:disconnected", event);
    };

    setWs(ws);

    return () => {
      ws.close();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ ws, status }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);

export default WebSocketProvider;
