import React, { useState, useEffect, useContext } from "react";
import emitter from "@/lib/emitter";
import config from "@/config";
import ReconnectingWebSocket, { ErrorEvent } from "reconnecting-websocket";
import getRandomPlayerSettings from "@/lib/helpers/get-random-player-settings";
import usePing from "@/hooks/use-ping";

export type WebSocketContextType = {
  ws: ReconnectingWebSocket | null;
  status: "connecting" | "connected" | "disconnected" | "error";
  playerData: PlayerData | null;
};

export type PlayerData = {
  authenticated: boolean;
  emoji: number;
  id: string;
  name: string;
  timezone: string;
};

type Handshake = {
  jwt: string;
  playerData: PlayerData;
};

const WebSocketContext = React.createContext<WebSocketContextType>({
  ws: null,
  status: "connecting",
  playerData: null,
});

const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [ws, setWs] = useState<ReconnectingWebSocket | null>(null);
  const [status, setStatus] =
    useState<WebSocketContextType["status"]>("connecting");
  const [playerData, setPlayerData] =
    useState<WebSocketContextType["playerData"]>(null);

  usePing(ws, status);

  const onEmitterSend = (event: string | any) => {
    if (!ws) {
      return;
    }

    ws.send(
      JSON.stringify({
        event: typeof event === "string" ? event : event.event,
        data:
          typeof event === "object"
            ? {
                ...event.data,
                event: undefined,
              }
            : undefined,
      })
    );
  };

  const onHandshakeFailed = () => {
    sendHandshake(true);
  };

  const onHandshakeReceived = ({ data }: { data: Handshake }) => {
    localStorage.setItem("fuseball:jwt", data.jwt);
    setPlayerData(data.playerData);

    emitter.emit("ws:connected");
    setStatus("connected");
  };

  const sendHandshake = (skipJwt?: boolean) => {
    const jwt = skipJwt ? "" : localStorage.getItem("fuseball:jwt");
    const playerSettings = jwt
      ? { name: "", emoji: 0 }
      : getRandomPlayerSettings();

    emitter.emit("ws:send", {
      event: "handshake",
      data: {
        jwt: jwt ?? "",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        playerName: jwt ? undefined : playerSettings.name,
        playerEmoji: jwt ? undefined : playerSettings.emoji,
      },
    });
  };

  useEffect(() => {
    emitter.on("ws:send", onEmitterSend);

    return () => {
      emitter.off("ws:send", onEmitterSend);
    };
  }, [ws, status]);

  useEffect(() => {
    const ws = new ReconnectingWebSocket(config.wsUrl);

    ws.onopen = () => {
      sendHandshake();
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

    ws.onerror = (event: ErrorEvent) => {
      setStatus("error");
      emitter.emit("ws:disconnected", event);
    };

    setWs(ws);

    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    emitter.on("ws:message:handshake", onHandshakeReceived);
    emitter.on("ws:message:handshake-failed", onHandshakeFailed);

    return () => {
      emitter.off("ws:message:handshake", onHandshakeReceived);
      emitter.off("ws:message:handshake-failed", onHandshakeFailed);
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ ws, status, playerData }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);

export default WebSocketProvider;
