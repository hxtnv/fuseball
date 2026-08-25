import { useEffect, useState } from "preact/hooks";
import type { Signal } from "@preact/signals";
import {
  TEAM_COLORS,
  lifetimeXp,
  levelFromXp,
  matchCoins,
  matchXp,
  type MatchResult,
} from "@fuseball/shared";
import { Button, Avatar, CountUp } from "@/components/ui";
import { TEAM_NAMES } from "@/lib/game/config";
import type { HudPlayer } from "@/lib/game";
import type { User } from "@/lib/auth";
import styles from "./endgame.module.scss";

interface EndgameProps {
  open: boolean;
  score0: number;
  score1: number;
  players: Signal<HudPlayer[]>;
  localId: Signal<number | null>;
  user?: User;
  onRestart: () => void;
  onLeave: () => void;
}

const RESULT_TEXT: Record<MatchResult, string> = {
  win: "Victory",
  loss: "Defeat",
  draw: "Draw",
};

const easeOutCubic = (k: number): number => 1 - Math.pow(1 - k, 3);

export const Endgame = (props: EndgameProps) =>
  props.open ? <EndgameScreen {...props} /> : null;

const EndgameScreen = ({
  score0,
  score1,
  players,
  localId,
  user,
  onRestart,
  onLeave,
}: EndgameProps) => {
  // capture the final table once (peek: don't re-render on late position ticks)
  const roster = players.peek();
  const myId = localId.peek();
  const me = roster.find((p) => p.id === myId);

  const winnerTeam = score0 === score1 ? -1 : score0 > score1 ? 0 : 1;
  const result: MatchResult =
    winnerTeam === -1 ? "draw" : me && me.team === winnerTeam ? "win" : "loss";

  const myGoals = me?.goals ?? 0;
  const coinsReward = matchCoins(myGoals, result);
  const xpReward = matchXp(myGoals, result);
  const baseXp = user ? lifetimeXp(user) : 0;

  const topScorer = roster.reduce<HudPlayer | null>(
    (best, p) => (p.goals > 0 && (!best || p.goals > best.goals) ? p : best),
    null,
  );

  // the xp bar fills later + slower than the numbers, for a satisfying beat
  const [xpT, setXpT] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const delay = 2600;
    const duration = 1600;
    const tick = (now: number) => {
      const elapsed = now - start - delay;
      const k = elapsed <= 0 ? 0 : Math.min(1, elapsed / duration);
      setXpT(easeOutCubic(k));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const level = levelFromXp(baseXp + xpReward * xpT);
  const progress = Math.min(100, (level.into / level.span) * 100);

  return (
    <div class={styles.endgame} data-result={result}>
      <div class={styles.endgame__inner}>
        <h1 class={styles.endgame__result}>{RESULT_TEXT[result]}</h1>

        <div class={styles.endgame__score}>
          <span style={{ color: TEAM_COLORS[0] }}>{score0}</span>
          <span class={styles.endgame__dash}>:</span>
          <span style={{ color: TEAM_COLORS[1] }}>{score1}</span>
        </div>

        <div class={styles.endgame__teams}>
          {([0, 1] as const).map((team) => {
            const won = winnerTeam === team;
            const list = roster
              .filter((p) => p.team === team)
              .sort(
                (a, b) => b.goals - a.goals || a.name.localeCompare(b.name),
              );
            return (
              <div
                key={team}
                class={styles.team}
                data-won={won}
                style={{ "--team": TEAM_COLORS[team] }}
              >
                <div class={styles.team__head}>
                  <span class={styles.team__name}>Team {TEAM_NAMES[team]}</span>
                  {won && <span class={styles.team__badge}>Winner</span>}
                </div>
                <ul class={styles.team__list}>
                  {list.map((p, i) => (
                    <li
                      key={p.id}
                      class={styles.player}
                      data-me={p.id === myId}
                      style={{
                        animationDelay: `${(team === 0 ? 500 : 650) + i * 150}ms`,
                      }}
                    >
                      <Avatar name={p.name} skin={p.skin} size={34} />
                      <span class={styles.player__name}>{p.name}</span>
                      {p.id === myId && (
                        <span class={styles.player__you}>You</span>
                      )}
                      {topScorer?.id === p.id && (
                        <span class={styles.player__mvp}>MVP</span>
                      )}
                      <span class={styles.player__goals}>
                        {p.goals > 0 ? (
                          <>
                            <span class={styles.player__goals__ball}>⚽</span>
                            {p.goals}
                          </>
                        ) : (
                          <span class={styles.player__goals__none}>—</span>
                        )}
                      </span>
                    </li>
                  ))}
                  {list.length === 0 && (
                    <li class={styles.player__empty}>No players</li>
                  )}
                </ul>
              </div>
            );
          })}
        </div>

        <div class={styles.rewards}>
          <div class={styles.rewards__coins}>
            <img src="/icons/currency/coin/gold.png" alt="Coins" />
            <div class={styles.rewards__coins__body}>
              <span class={styles.rewards__label}>Coins earned</span>
              <CountUp
                class={styles.rewards__coins__value}
                value={coinsReward}
                delay={1500}
                duration={1000}
                format={(n) => `+${n.toLocaleString()}`}
              />
            </div>
          </div>

          <div class={styles.rewards__xp}>
            <div class={styles.rewards__xp__top}>
              <span class={styles.rewards__level}>Level {level.level}</span>
              <CountUp
                class={styles.rewards__xp__gain}
                value={xpReward}
                delay={2600}
                duration={1500}
                format={(n) => `+${n.toLocaleString()} XP`}
              />
            </div>
            <div class={styles.rewards__bar}>
              <div
                class={styles.rewards__bar__fill}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span class={styles.rewards__xp__meta}>
              {Math.floor(level.into)} / {level.span} XP
            </span>
          </div>
        </div>

        <div class={styles.endgame__actions}>
          <Button variant="secondary" size="large" onClick={onLeave}>
            Back to menu
          </Button>
          <Button variant="primary" size="large" onClick={onRestart}>
            Play again
          </Button>
        </div>
      </div>
    </div>
  );
};
