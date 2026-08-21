import { useEffect, useRef } from "preact/hooks";
import { buildWsUrl } from "../auth";
import { createGame } from "../game";
import type { PlaySession } from "./main-menu";

interface Props {
  session: PlaySession;
  onLeave: () => void;
}

export function GameCanvas({ session, onLeave }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const wsUrl = buildWsUrl(session.wsUrl, session.token, session.roomId);
    const game = createGame(canvas, wsUrl);
    game.start();
    return () => game.stop();
  }, [session]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onLeave();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onLeave]);

  return (
    <div class="play">
      <canvas ref={ref} class="game-canvas" />
      <button class="leave-btn" onClick={onLeave} title="Leave (Esc)">
        ← Leave
      </button>
    </div>
  );
}
