import {
  ChevronRight,
  Coins,
  Gift,
  Server as ServerIcon,
  Settings,
  Trophy,
  UserPlus,
  PlayIcon,
} from "lucide-react";
import { Box, Button } from "../ui";
import type { GameServerInfo, User } from "../../auth";
import { MOCK_FRIENDS, MOCK_NEWS } from "./mock";
import styles from "./menu.module.css";

/* ------------------------------- top bar ------------------------------- */
interface TopBarProps {
  coins: number;
  onLeaderboard: () => void;
  onRewards: () => void;
  onSettings: () => void;
}

export function TopBar({
  coins,
  onLeaderboard,
  onRewards,
  onSettings,
}: TopBarProps) {
  return (
    <div class={styles.topbar}>
      <img class={styles.logo} src="/logo.png" alt="Fuseball" />
      <div class={styles.topRight}>
        <Box class={styles.coins} flush>
          <Coins size={18} /> {coins.toLocaleString()}
        </Box>
        <button
          class={`ui-box ${styles.iconBtn}`}
          onClick={onLeaderboard}
          title="Leaderboard"
        >
          <Trophy size={20} />
        </button>
        <button
          class={`ui-box ${styles.iconBtn}`}
          onClick={onRewards}
          title="Rewards"
        >
          <Gift size={20} />
        </button>
        <button
          class={`ui-box ${styles.iconBtn}`}
          onClick={onSettings}
          title="Settings"
        >
          <Settings size={20} />
        </button>
      </div>
    </div>
  );
}

/* ----------------------------- player card ----------------------------- */
interface PlayerCardProps {
  user: User;
  onEditProfile: () => void;
}

export function PlayerCard({ user, onEditProfile }: PlayerCardProps) {
  const level = 1 + Math.floor(user.gamesPlayed / 5);
  const xp = (user.gamesPlayed % 5) / 5;
  const winrate =
    user.gamesPlayed > 0
      ? `${Math.round((user.wins / user.gamesPlayed) * 100)}%`
      : "—";

  return (
    <Box class={styles.player}>
      <div class={styles.ribbon}>
        <span class={styles.ribbonLvl}>LVL</span>
        <span class={styles.ribbonNum}>{level}</span>
      </div>
      <div class={styles.playerTop}>
        <div class={styles.avatar} />
        <div class={styles.nameCol}>
          <div class={styles.nameRow}>
            <span class={styles.pName}>{user.name}</span>
          </div>
          <div class={styles.level}>
            <div class={styles.levelText}>
              <span>Level {level}</span>
              <span>{Math.round(xp * 100)}%</span>
            </div>
            <div class={styles.levelBar}>
              <div class={styles.levelFill} style={{ width: `${xp * 100}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div class={styles.stats}>
        <div class={styles.stat}>
          <span class={styles.statVal}>{user.gamesPlayed}</span>
          <span class={styles.statLabel}>Played</span>
        </div>
        <div class={styles.stat}>
          <span class={styles.statVal}>{user.wins}</span>
          <span class={styles.statLabel}>Wins</span>
        </div>
        <div class={styles.stat}>
          <span class={styles.statVal}>{winrate}</span>
          <span class={styles.statLabel}>Winrate</span>
        </div>
      </div>

      <Button block variant="secondary" size="small" onClick={onEditProfile}>
        Edit profile
      </Button>
    </Box>
  );
}

/* -------------------------------- news --------------------------------- */
export function NewsFloat({ onViewAll }: { onViewAll: () => void }) {
  const latest = MOCK_NEWS[0];
  if (!latest) return null;
  return (
    <Box class={styles.newsFloat} flush>
      <img class={styles.newsImg} src="/news-placeholder.png" alt="" />
      <div class={styles.newsPad}>
        <span class={styles.newsTag}>Latest News</span>
        <div class={styles.newsTitle}>{latest.title}</div>
        <div class={styles.newsDate}>{latest.date}</div>
        <div class={styles.newsBody}>{latest.body}</div>
        <div style={{ marginTop: "12px" }}>
          <Button block variant="secondary" size="small" onClick={onViewAll}>
            View all news
          </Button>
        </div>
      </div>
    </Box>
  );
}

/* -------------------------- center play buttons ------------------------ */
interface PlayButtonsProps {
  onQuickPlay: () => void;
  onWarmup: () => void;
  onParty: () => void;
  ready: boolean;
}

export function PlayButtons(p: PlayButtonsProps) {
  return (
    <div class={styles.playCol}>
      <Button
        block
        size="large"
        class={styles.quickBtn}
        onClick={p.onQuickPlay}
        disabled={!p.ready}
      >
        <img src="/icons/other/trade.png" alt="" width={48} height={48} />

        <span>Quick Play</span>
        <span class={styles.playArrow}>
          <PlayIcon size={30} />
        </span>
      </Button>

      <div class={styles.modeRow2}>
        <Button
          block
          class={`${styles.modeBtn} ${styles.warmBtn}`}
          onClick={p.onWarmup}
          disabled={!p.ready}
        >
          <img src="/icons/other/target.png" alt="" width={52} height={52} />
          <div>
            <span>Warmup</span>
            <span class={styles.playArrow2}>
              <PlayIcon size={30} />
            </span>
          </div>
        </Button>
        <Button
          block
          class={`${styles.modeBtn} ${styles.partyBtn}`}
          onClick={p.onParty}
        >
          <img src="/icons/other/friend.png" alt="" width={52} height={52} />

          <div>
            <span>Party</span>
            <span class={styles.playArrow2}>
              <PlayIcon size={30} />
            </span>
          </div>
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------ friends -------------------------------- */
export function FriendsRail({ onInvite }: { onInvite: () => void }) {
  const dotClass = (s: string) =>
    s === "in-game"
      ? styles.dotGame
      : s === "online"
        ? styles.dotOnline
        : styles.dotOffline;
  const label = (s: string) =>
    s === "in-game" ? "In game" : s === "online" ? "Online" : "Offline";

  return (
    <Box class={styles.card}>
      <div class={styles.cardHead}>
        <span>Friends</span>
        <span>
          {MOCK_FRIENDS.filter((f) => f.status !== "offline").length} online
        </span>
      </div>
      <div class={styles.friends}>
        {MOCK_FRIENDS.map((f) => (
          <div class={styles.friend} key={f.name}>
            <span class={`${styles.dot} ${dotClass(f.status)}`} />
            <span class={styles.friendName}>{f.name}</span>
            <span class={styles.friendStatus}>{label(f.status)}</span>
          </div>
        ))}
      </div>
      <div class={styles.friendsFoot}>
        <Button block variant="secondary" size="small" onClick={onInvite}>
          <UserPlus size={15} /> Add friend
        </Button>
      </div>
    </Box>
  );
}

/* --------------------- server picker (left wing) ---------------------- */
export function ServerBox({
  server,
  onOpen,
}: {
  server: GameServerInfo | undefined;
  onOpen: () => void;
}) {
  const meta = server
    ? server.online === false
      ? "offline"
      : `${server.players ?? 0} playing`
    : "no server";

  return (
    <button class={`ui-box ${styles.serverBox}`} onClick={onOpen}>
      <ServerIcon size={18} />
      <div class={styles.serverBoxInfo}>
        <span class={styles.serverBoxName}>{server?.name ?? "—"}</span>
        <span class={styles.serverBoxMeta}>{meta}</span>
      </div>
      <ChevronRight size={16} />
    </button>
  );
}

/* ------------------------- bottom bar (footer) ------------------------- */
export function Footer() {
  return (
    <div class={styles.footer}>
      <div class={styles.social}>
        <a
          href="https://twitter.com/fuseball_game"
          target="_blank"
          rel="noreferrer"
          title="Twitter"
        >
          <Button block variant="secondary">
            <img
              src="/icons/social/twitter.png"
              alt="Twitter"
              width={36}
              height={36}
            />
          </Button>
        </a>

        <a
          href="https://discord.gg/B8Pp9nrpdD"
          target="_blank"
          rel="noreferrer"
          title="Discord"
        >
          <Button block variant="secondary">
            <img
              src="/icons/social/discord.png"
              alt="Discord"
              width={36}
              height={36}
            />
          </Button>
        </a>
      </div>
    </div>
  );
}
