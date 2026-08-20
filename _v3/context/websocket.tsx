import { useEffect, useState } from "react";
import { WebSocketContext } from "./websocket-context";
import { API_WSS } from "../lib/const/api";
import ReconnectingWebSocket from "reconnecting-websocket";

export const WebSocketProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [webSocket, setWebSocket] = useState<ReconnectingWebSocket | null>(
    null
  );

  useEffect(() => {
    const ws = new ReconnectingWebSocket(API_WSS);
    setWebSocket(ws);

    return () => {
      ws.close();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={webSocket}>
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketProvider;
