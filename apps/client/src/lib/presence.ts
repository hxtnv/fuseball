import { useEffect, useState } from "preact/hooks";
import { API } from "./game/config";
import { getToken } from "./auth";

const presenceUrl = (): string => {
  const base = `${API.baseUrl.replace(/^http/, "ws")}/presence`;
  const token = getToken();
  return token ? `${base}?token=${encodeURIComponent(token)}` : base;
};

// Holds a persistent socket to the central server for as long as the app is open
// (menu or game), and returns the live online count it broadcasts. Reconnects
// when the token changes so the server can dedupe the count by user.
export const usePresence = (): number => {
  const [online, setOnline] = useState(0);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let retry: ReturnType<typeof setTimeout> | null = null;
    let closed = false;

    const connect = (): void => {
      ws = new WebSocket(presenceUrl());
      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data as string) as {
            type: string;
            count: number;
          };
          if (msg.type === "online") setOnline(msg.count);
        } catch {
          /* ignore malformed frames */
        }
      };
      ws.onclose = () => {
        if (!closed) retry = setTimeout(connect, 2000); // auto-reconnect
      };
    };

    // reconnect with the new token (without triggering the auto-reconnect path)
    const onTokenChange = (): void => {
      if (closed) return;
      if (retry) {
        clearTimeout(retry);
        retry = null;
      }
      if (ws) {
        ws.onclose = null;
        ws.onmessage = null;
        ws.close();
      }
      connect();
    };

    connect();
    window.addEventListener("fuseball:token", onTokenChange);
    return () => {
      closed = true;
      if (retry) clearTimeout(retry);
      window.removeEventListener("fuseball:token", onTokenChange);
      ws?.close();
    };
  }, []);

  return online;
};
