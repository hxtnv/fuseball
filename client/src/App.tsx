import { Fragment, useEffect, useState } from "react";

import WebSocketProvider, { useWebSocket } from "@/context/websocket.context";
import GameContextProvider from "@/context/game.context";

import Home from "@/views/home";
import GameSketch from "@/views/game-sketch";

import Navbar from "@/components/domain/navbar";
import DisconnectedModal from "@/components/modals/disconnected";
import GameLoaderModal from "@/components/modals/game-loader";

import { useGameContext } from "@/context/game.context";

const App = () => {
  useEffect(() => {
    const handleContextmenu = (e: MouseEvent) => e.preventDefault();

    document.addEventListener("contextmenu", handleContextmenu);

    return () => {
      document.removeEventListener("contextmenu", handleContextmenu);
    };
  }, []);

  return (
    <WebSocketProvider>
      <GameContextProvider>
        <AppInner />
      </GameContextProvider>
    </WebSocketProvider>
  );
};

const AppInner = () => {
  const [displayGameSketch, setDisplayGameSketch] = useState(false);
  const { currentLobby } = useGameContext();
  const { getSelfPlayerData } = useWebSocket();

  useEffect(() => {
    if (!displayGameSketch) {
      getSelfPlayerData();
    }
  }, [displayGameSketch]);

  useEffect(() => {
    const timeout = setTimeout(
      () => {
        if (currentLobby) close();

        setDisplayGameSketch(!!currentLobby);
      },
      currentLobby ? 1500 : 0
    );

    return () => {
      clearTimeout(timeout);
    };
  }, [currentLobby]);

  return (
    <>
      <DisconnectedModal />
      <GameLoaderModal displayGameSketch={displayGameSketch} />

      {displayGameSketch ? (
        <GameSketch />
      ) : (
        <Fragment>
          <Navbar />
          <Home />
        </Fragment>
      )}
    </>
  );
};

export default App;
