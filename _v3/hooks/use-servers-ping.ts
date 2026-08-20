import { useState, useEffect, useRef } from "react";
import type { Server } from "shared/types/api";
import { PING_INTERVAL } from "@/lib/const/game-server";
import ReconnectingWebSocket from "reconnecting-websocket";

// -1 ping = connection error
// -2 ping = connecting

const useServersPing = (servers: Server[]) => {
  const [ping, setPing] = useState<Record<number, number>>({});
  const socketRefs = useRef<Record<number, ReconnectingWebSocket>>({});
  const pingTimersRef = useRef<Record<number, NodeJS.Timeout>>({});
  const pingTimestampsRef = useRef<Record<number, number>>({});

  const pingServer = (server: Server) => {
    if (!socketRefs.current[server.id]) {
      const socket = new ReconnectingWebSocket(server.ws);

      socket.onopen = () => {
        // console.log(`Connected to server ${server.name}`);
        if (pingTimersRef.current[server.id]) {
          clearInterval(pingTimersRef.current[server.id]);
        }

        const sendPing = () => {
          if (socket.readyState === ReconnectingWebSocket.OPEN) {
            pingTimestampsRef.current[server.id] = Date.now();
            socket.send(JSON.stringify({ type: "ping" }));
          }
        };

        sendPing();

        pingTimersRef.current[server.id] = setInterval(sendPing, PING_INTERVAL);
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "pong") {
            const latency = Date.now() - pingTimestampsRef.current[server.id];
            setPing((prev) => ({ ...prev, [server.id]: latency }));
          }
        } catch {
          // console.error("Error parsing WebSocket message:", error);
        }
      };

      socket.onerror = () => {
        // console.error(`WebSocket error for server ${server.name}:`, error);
        setPing((prev) => ({ ...prev, [server.id]: -1 }));
      };

      socket.onclose = () => {
        // console.log(`Disconnected from server ${server.name}`);
        setPing((prev) => ({ ...prev, [server.id]: -1 }));

        if (pingTimersRef.current[server.id]) {
          clearInterval(pingTimersRef.current[server.id]);
        }
      };

      socketRefs.current[server.id] = socket;
    }
  };

  useEffect(() => {
    servers.forEach((server) => {
      pingServer(server);
    });

    return () => {
      Object.entries(socketRefs.current).forEach(([id, socket]) => {
        if (socket && socket.readyState === ReconnectingWebSocket.OPEN) {
          socket.close();
        }

        if (pingTimersRef.current[Number(id)]) {
          clearInterval(pingTimersRef.current[Number(id)]);
        }
      });

      socketRefs.current = {};
      pingTimersRef.current = {};
    };
  }, [servers]);

  return ping;
};

export default useServersPing;
