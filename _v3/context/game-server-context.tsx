import type { WebSocketHookResult } from "@/hooks/use-websocket";
import { createContext } from "react";
import type { Server } from "shared/types/api";

interface GameServerContextType {
  selectedServer: Server | null;
  setSelectedServer: (server: Server | null) => void;
  list: Server[];
  pings: Record<number, number>;
  webSocket: WebSocketHookResult | null;
}

export const GameServerContext = createContext<GameServerContextType>({
  selectedServer: null,
  setSelectedServer: () => {},
  list: [],
  pings: {},
  webSocket: null,
});
