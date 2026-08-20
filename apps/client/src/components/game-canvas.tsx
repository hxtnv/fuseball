import { useEffect, useRef } from "preact/hooks";
import { createGame } from "../game";

export function GameCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const game = createGame(canvas);
    game.start();
    return () => game.stop();
  }, []);

  return <canvas ref={ref} class="game-canvas" />;
}
