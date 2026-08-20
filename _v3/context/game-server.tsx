import { useEffect, useState } from "react";
import type { Server } from "shared/types/api";
import { GameServerContext } from "./game-server-context";
import useApiQuery from "@/hooks/use-api-query";
import type { ServerListResponse } from "shared/types/api";
import useServersPing from "@/hooks/use-servers-ping";
import StorageKeys from "@/lib/const/storage-keys";
import useWebsocket from "@/hooks/use-websocket";
import useGameContext from "@/hooks/context/use-game";

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: serversData } = useApiQuery<ServerListResponse>("/servers", {
    method: "GET",
  });

  const { setView, view } = useGameContext();

  const [selectedServer, setSelectedServer] = useState<Server | null>(null);

  const serverPings = useServersPing(serversData?.list ?? []);
  const webSocket = useWebsocket(
    selectedServer
      ? `${selectedServer.ws}?jwt=${localStorage.getItem(StorageKeys.JWT)}`
      : undefined
  );

  useEffect(() => {
    const unsubscribe = webSocket.subscribe("disconnection", () => {
      if (view === "game") {
        alert("Connnection to the game server has been lost");
        setView("home");
      }
    });

    return unsubscribe;
  }, [setView, view, webSocket]);

  useEffect(() => {
    if (selectedServer || !serversData?.list?.length) {
      return;
    }

    const lowestPingServer = serversData?.list
      .filter((s) => serverPings[s.id] >= 0)
      .sort((a, b) => serverPings[a.id] - serverPings[b.id])[0];

    if (lowestPingServer) {
      setSelectedServer(lowestPingServer);
    }
  }, [selectedServer, serverPings, serversData?.list]);

  return (
    <GameServerContext.Provider
      value={{
        selectedServer,
        setSelectedServer,
        list: serversData?.list ?? [],
        pings: serverPings,
        webSocket,
      }}
    >
      {children}
    </GameServerContext.Provider>
  );
};

export default GameProvider;
