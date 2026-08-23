import { TEAM_COLORS } from "@fuseball/shared";
import type { Signal } from "@preact/signals";
import { Button, Modal } from "@/components/ui";
import { TEAM_NAMES } from "@/lib/game/config";
import type { HudPlayer } from "@/lib/game";
import styles from "./endgame.module.scss";

interface EndgameProps {
  open: boolean;
  score0: number;
  score1: number;
  players: Signal<HudPlayer[]>;
  onRestart: () => void;
  onLeave: () => void;
}

const TEAMS = [0, 1] as const;

export const Endgame = ({
  open,
  score0,
  score1,
  players,
  onRestart,
  onLeave,
}: EndgameProps) => {
  const heading =
    score0 === score1
      ? "It's a draw"
      : `Team ${TEAM_NAMES[score0 > score1 ? 0 : 1]} wins!`;

  return (
    <Modal open={open} onClose={() => {}} width={460} title={{ text: heading }}>
      <div class={styles.endgame}>
        <div class={styles.endgame__score}>
          <span style={{ color: TEAM_COLORS[0] }}>{score0}</span>
          <span class={styles.endgame__dash}>—</span>
          <span style={{ color: TEAM_COLORS[1] }}>{score1}</span>
        </div>

        <div class={styles.endgame__teams}>
          {TEAMS.map((t) => (
            <div key={t} class={styles.endgame__team}>
              <h5 style={{ color: TEAM_COLORS[t] }}>Team {TEAM_NAMES[t]}</h5>
              <ul>
                {players.value
                  .filter((p) => p.team === t)
                  .map((p) => (
                    <li key={p.id}>{p.name}</li>
                  ))}
              </ul>
            </div>
          ))}
        </div>

        <div class={styles.endgame__actions}>
          <Button variant="secondary" onClick={onLeave}>
            Back to menu
          </Button>
          <Button variant="primary" onClick={onRestart}>
            Play again
          </Button>
        </div>
      </div>
    </Modal>
  );
};
