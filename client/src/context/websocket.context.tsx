import React, { useState, useEffect, useContext } from "react";
import emitter from "@/lib/emitter";
import config from "@/config";
import ReconnectingWebSocket, { ErrorEvent } from "reconnecting-websocket";
import usePing from "@/hooks/use-ping";

export type WebSocketContextType = {
  ws: ReconnectingWebSocket | null;
  status: "connecting" | "connected" | "disconnected" | "error";
  playerData: PlayerData | null;
  signOut: () => void;
  sendHandshake: (overwriteJwt?: string) => void;
};

export type PlayerData = {
  authenticated: boolean;
  emoji: number;
  id: number;
  name: string;
  timezone: string;
  country_code: string;
  total_wins: number;
  total_goals: number;
  total_games: number;
  xp: number;
  email: string;
};

type Handshake = {
  jwt: string;
  playerData: PlayerData;
};

const WebSocketContext = React.createContext<WebSocketContextType>({
  ws: null,
  status: "connecting",
  playerData: null,
  signOut: () => {},
  sendHandshake: () => {},
});

const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [ws, setWs] = useState<ReconnectingWebSocket | null>(null);
  const [status, setStatus] =
    useState<WebSocketContextType["status"]>("connecting");
  const [playerData, setPlayerData] =
    useState<WebSocketContextType["playerData"]>(null);

  usePing(ws, status);

  const signOut = () => {
    localStorage.removeItem("fuseball:jwt");
    setPlayerData(null);

    // todo: this could be improved
    window.location.reload();
  };

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
    sendHandshake("");
  };

  const onHandshakeReceived = ({ data }: { data: Handshake }) => {
    console.log("onHandshakeReceived", data.playerData);
    localStorage.setItem("fuseball:jwt", data.jwt);
    setPlayerData(data.playerData);

    emitter.emit("ws:connected");
    setStatus("connected");
  };

  const sendHandshake = (overwriteJwt?: string) => {
    const jwt =
      typeof overwriteJwt === "string"
        ? overwriteJwt
        : localStorage.getItem("fuseball:jwt");

    setPlayerData(null);

    emitter.emit("ws:send", {
      event: "handshake",
      data: {
        jwt: jwt ?? "",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
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
    <WebSocketContext.Provider
      value={{ ws, status, playerData, signOut, sendHandshake }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);

export default WebSocketProvider;
