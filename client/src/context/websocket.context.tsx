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
    useState<WebSocketContextType["status"]>("connected");

  useEffect(() => {
    const ws = new WebSocket(config.wsUrl);

    ws.onopen = () => {
      console.info("WebSocket connection established");
      emitter.emit("ws:connected");
      // setStatus("connected");
    };

    ws.onmessage = (event) => {
      const parsedMessage = JSON.parse(event.data);
      console.info("WebSocket message received: ", parsedMessage);
      emitter.emit("ws:message", parsedMessage);
      emitter.emit(`ws:message:${parsedMessage.type}`, parsedMessage);
    };

    ws.onclose = () => {
      console.info("WebSocket connection closed");
      // setStatus("disconnected");
      emitter.emit("ws:disconnected");
    };

    ws.onerror = (event: Event) => {
      console.error("WebSocket error: ", event);
      // setStatus("error");
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
