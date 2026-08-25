import { useEffect, useMemo, useRef } from "preact/hooks";
import { buildWsUrl } from "@/lib/auth";
import { createGame, type Game } from "@/lib/game";
import type { PlaySession } from "@/views/menu";
import { GameHud } from "./hud";
import { applyHud, createHudStore } from "./hud/store";
import styles from "./game.module.scss";

interface Props {
  session: PlaySession;
  onLeave: () => void;
}

export const GameCanvas = ({ session, onLeave }: Props) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const hud = useMemo(createHudStore, []);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const wsUrl = buildWsUrl(
      session.wsUrl,
      session.token,
      session.roomId,
      session.skin,
    );
    const game = createGame(canvas, wsUrl, (h) => applyHud(hud, h));
    gameRef.current = game;
    game.start();
    return () => {
      game.stop();
      gameRef.current = null;
    };
  }, [session]);

  return (
    <div class={styles.game}>
      <canvas ref={ref} class={styles.game__canvas} />
      <div class={styles.game__vignette} />
      <div class={styles.game__grain} />
      <GameHud
        hud={hud}
        onLeave={onLeave}
        onMove={(x, y) => gameRef.current?.setMoveVector(x, y)}
        onKick={() => gameRef.current?.kick()}
        onSprint={(down) => gameRef.current?.setSprint(down)}
        onRestart={() => gameRef.current?.restart()}
      />
    </div>
  );
};
