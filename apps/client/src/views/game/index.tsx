import { useEffect, useRef } from "preact/hooks";
import { buildWsUrl } from "@/lib/auth";
import { createGame } from "@/lib/game";
import type { PlaySession } from "@/views/menu";
import styles from "./game.module.scss";

interface Props {
  session: PlaySession;
  onLeave: () => void;
}

export const GameCanvas = ({ session, onLeave }: Props) => {
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
    <div class={styles.game}>
      <canvas ref={ref} class={styles.game__canvas} />
      <button class={styles.game__leave} onClick={onLeave} title="Leave (Esc)">
        ← Leave
      </button>
    </div>
  );
};
