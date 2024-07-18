import { useEffect } from "react";
import GameSketch from "./views/game-sketch";

function App() {
  useEffect(() => {
    const handleContextmenu = (e: MouseEvent) => e.preventDefault();

    document.addEventListener("contextmenu", handleContextmenu);

    return () => {
      document.removeEventListener("contextmenu", handleContextmenu);
    };
  }, []);

  return (
    <>
      <GameSketch />
    </>
  );
}

export default App;
