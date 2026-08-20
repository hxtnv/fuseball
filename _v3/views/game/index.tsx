import Q5Canvas from "q5-react";
import Overlay from "./components/overlay";
import useGameCanvas from "./hooks/use-game-canvas";
import { useEffect } from "react";
import useGameContext from "@/hooks/context/use-game";
import { useNavigate } from "react-router-dom";

const Game = () => {
  const canvas = useGameCanvas();
  const { lobbyId } = useGameContext();

  const navigate = useNavigate();

  useEffect(() => {
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, []);

  useEffect(() => {
    if (!lobbyId) {
      navigate("/");
    }
  }, [lobbyId, navigate]);

  const onBeforeUnload = (e: BeforeUnloadEvent) => {
    e.preventDefault();
  };

  return (
    <Q5Canvas canvas={canvas} size="fullscreen">
      <Overlay />
    </Q5Canvas>
  );
};

export default Game;
