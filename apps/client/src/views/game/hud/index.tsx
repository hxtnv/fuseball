import { computed } from "@preact/signals";
import { useEffect, useMemo, useState } from "preact/hooks";
import { LogOut } from "lucide-react";
import { TEAM_COLORS } from "@fuseball/shared";
import { Button, Modal } from "@/components/ui";
import type { User } from "@/lib/auth";
import { Roster } from "./parts/roster";
import { TouchControls } from "./parts/touch-controls";
import { Endgame } from "./parts/endgame";
import { GoalBanner } from "./parts/goal-banner";
// import { Minimap } from "./parts/minimap";
import { StaminaBar } from "./parts/stamina";
import type { HudStore } from "./store";
import styles from "./hud.module.scss";
import { TEAM_NAMES } from "@/lib/game/config";

const clock = (s: number): string => {
  const m = Math.floor(s / 60);
  const sec = Math.max(0, Math.floor(s % 60));
  return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
};

const STATUS_DETAILS: Record<string, { text: string; color: string }> = {
  warmup: { text: "Waiting for players...", color: "#7dd3fc" },
  protected: { text: "Get ready...", color: "#ffd166" },
  celebrating: { text: "GOAL!", color: "#ffd23f" },
  finished: { text: "Game over!", color: "#ff7a7a" },
  live: { text: "Game is live", color: "#34cf93" },
};

interface GameHudProps {
  hud: HudStore;
  user?: User;
  onLeave: () => void;
  onMove?: (x: number, y: number) => void;
  onKick?: () => void;
  onSprint?: (down: boolean) => void;
  onRestart?: () => void;
}

export const GameHud = ({
  hud,
  user,
  onLeave,
  onMove,
  onKick,
  onSprint,
  onRestart,
}: GameHudProps) => {
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setConfirm((c) => !c);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // computed strings update their text node without re-rendering the component
  const timeText = useMemo(() => computed(() => clock(hud.time.value)), [hud]);
  const pingText = useMemo(
    () =>
      computed(() => (hud.ping.value == null ? "-" : `${hud.ping.value}ms`)),
    [hud],
  );
  const quality = useMemo(
    () =>
      computed(() => {
        if (!hud.connected.value) return "bad";
        const p = hud.ping.value ?? 999;
        return p < 80 ? "good" : p < 160 ? "ok" : "bad";
      }),
    [hud],
  );

  const status = hud.status.value;
  const scoringTeam = hud.lastScoringTeam.value;
  const score0 = hud.score0.value;
  const score1 = hud.score1.value;

  return (
    <>
      <Button
        class={styles.hud__leave}
        variant="tertiary"
        iconSize={20}
        icon={<LogOut />}
        onClick={() => setConfirm(true)}
        title="Leave (Esc)"
      />

      {/* <div class={styles.hud__score}>
        <div class={styles.hud__score__team} style={{ color: TEAM_COLORS[0] }}>
          {hud.score0}
        </div>

        <div class={styles.hud__score__center}>
          {status === "warmup" && <h5>Waiting for players…</h5>}
          {status === "protected" && (
            <h5>
              Get ready · <b>{hud.protectedRemaining}</b>
            </h5>
          )}
          {status === "celebrating" && (
            <h5
              style={{
                color: scoringTeam !== null ? TEAM_COLORS[scoringTeam] : "#fff",
              }}
            >
              GOAL!
            </h5>
          )}
          {status === "finished" && <h5>Full time</h5>}
          <h3>{timeText}</h3>
        </div>

        <div class={styles.hud__score__team} style={{ color: TEAM_COLORS[1] }}>
          {hud.score1}
        </div>
      </div> */}
      <div class={styles.hud__score2}>
        <div class={styles.hud__score2__team} style={{ color: TEAM_COLORS[0] }}>
          <h5 class="ui-box">Team {TEAM_NAMES[0]}</h5>
          <h3 class="ui-box">{hud.score0}</h3>
        </div>

        <div class={styles.hud__score2__time}>
          <h5>{timeText}</h5>
          <h6 style={{ color: STATUS_DETAILS[status]?.color }}>
            {STATUS_DETAILS[status]?.text}
          </h6>
        </div>

        <div class={styles.hud__score2__team} style={{ color: TEAM_COLORS[1] }}>
          <h3 class="ui-box">{hud.score1}</h3>
          <h5 class="ui-box">Team {TEAM_NAMES[1]}</h5>
        </div>
      </div>

      <div class={styles.hud__status} data-quality={quality}>
        <span class={styles.hud__status__dot} />
        <span>{pingText}</span>
        <span class={styles.hud__status__fps}>{hud.fps} fps</span>
      </div>

      {status === "celebrating" && <GoalBanner team={scoringTeam} />}

      {/* <div className={styles.hud__watermark}>fuseball.io</div> */}

      <Roster players={hud.players} team={0} side="left" />
      <Roster players={hud.players} team={1} side="right" />

      <div class={styles.hud__corner}>
        <StaminaBar value={hud.stamina} />
        {/* <Minimap players={hud.players} /> */}
      </div>

      <div class={styles.hud__controls}>
        <span>
          <kbd>W</kbd>
          <kbd>A</kbd>
          <kbd>S</kbd>
          <kbd>D</kbd> Move
        </span>
        <span>
          <kbd>Space</kbd>
          <kbd>X</kbd> Kick
        </span>
        <span>
          <kbd>Shift</kbd> Sprint
        </span>
        {/* <span>
          <kbd>Q</kbd> Graphics
        </span> */}
        <span>
          <kbd>Esc</kbd> Menu
        </span>
      </div>

      <TouchControls
        onMove={onMove ?? (() => {})}
        onKick={onKick}
        onSprint={onSprint}
      />

      <Endgame
        open={status === "finished"}
        score0={score0}
        score1={score1}
        players={hud.players}
        localId={hud.localId}
        user={user}
        onRestart={onRestart ?? (() => {})}
        onLeave={onLeave}
      />

      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        width={380}
        title={{ text: "Leave match?", icon: <LogOut /> }}
      >
        <p class={styles.hud__confirm}>
          You'll forfeit this match and return to the menu.
        </p>
        <div class={styles.hud__confirm__actions}>
          <Button variant="secondary" onClick={() => setConfirm(false)}>
            Stay
          </Button>
          <Button variant="danger" onClick={onLeave}>
            Leave
          </Button>
        </div>
      </Modal>
    </>
  );
};
