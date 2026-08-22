import { Box, Button } from "@/components/ui";
import type { User } from "@/lib/auth";
import styles from "./player-card.module.scss";

interface PlayerCardProps {
  user: User;
  onEditProfile: () => void;
}

export const PlayerCard = ({ user, onEditProfile }: PlayerCardProps) => {
  const level = 1 + Math.floor(user.gamesPlayed / 5);
  const xp = (user.gamesPlayed % 5) / 5;
  const winrate =
    user.gamesPlayed > 0
      ? `${Math.round((user.wins / user.gamesPlayed) * 100)}%`
      : "-";

  return (
    <Box class={styles.playerCard}>
      <div class={styles.playerCard__ribbon}>
        <span class={styles.playerCard__ribbon__label}>LVL</span>
        <span class={styles.playerCard__ribbon__value}>{level}</span>
      </div>

      <div class={styles.playerCard__top}>
        <div class={styles.playerCard__top__avatar} />
        <div class={styles.playerCard__top__name}>
          <span class={styles.playerCard__top__name__text}>{user.name}</span>
          <div class={styles.playerCard__level}>
            <div class={styles.playerCard__level__text}>
              <span>Level {level}</span>
              <span>{Math.round(xp * 100)}%</span>
            </div>
            <div class={styles.playerCard__level__bar}>
              <div
                class={styles.playerCard__level__fill}
                style={{ width: `${xp * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div class={styles.playerCard__stats}>
        <div class={styles.playerCard__stats__item}>
          <span class={styles.playerCard__stats__item__value}>
            {user.gamesPlayed}
          </span>
          <span class={styles.playerCard__stats__item__label}>Played</span>
        </div>
        <div class={styles.playerCard__stats__item}>
          <span class={styles.playerCard__stats__item__value}>{user.wins}</span>
          <span class={styles.playerCard__stats__item__label}>Wins</span>
        </div>
        <div class={styles.playerCard__stats__item}>
          <span class={styles.playerCard__stats__item__value}>{winrate}</span>
          <span class={styles.playerCard__stats__item__label}>Win rate</span>
        </div>
      </div>

      <Button block variant="secondary" size="small" onClick={onEditProfile}>
        Edit profile
      </Button>
    </Box>
  );
};
