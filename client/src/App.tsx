import { useEffect } from "react";
import WebSocketProvider from "./context/websocket.context";
import GameContextProvider from "./context/game.context";
import Home from "./views/home";

function App() {
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
        <Home />
      </GameContextProvider>
    </WebSocketProvider>
  );
}

export default App;
