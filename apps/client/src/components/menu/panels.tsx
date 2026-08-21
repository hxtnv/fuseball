import {
  Coins,
  Gift,
  Heart,
  Server as ServerIcon,
  Settings,
  Trophy,
  UserPlus,
} from "lucide-react";
import { Box, Button } from "../ui";
import type { GameServerInfo, User } from "../../auth";
import { MOCK_FRIENDS, MOCK_NEWS } from "./mock";
import { ArrowIcon, BallIcon, FlameIcon, PartyIcon } from "./play-icons";
import styles from "./menu.module.css";

/* brand logos (lucide dropped brand icons, so these are inline) */
const XIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
const DiscordIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.369A19.79 19.79 0 0 0 16.558 3.2a.07.07 0 0 0-.073.035c-.211.375-.444.864-.608 1.249a18.27 18.27 0 0 0-5.487 0 12.6 12.6 0 0 0-.617-1.249.07.07 0 0 0-.073-.035A19.74 19.74 0 0 0 5.677 4.37a.06.06 0 0 0-.03.024C3.044 8.279 2.488 12.06 2.36 15.799a.08.08 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.07.07 0 0 0 .078-.027c.462-.63.874-1.295 1.226-1.994a.07.07 0 0 0-.041-.1 13.1 13.1 0 0 1-1.872-.892.07.07 0 0 1-.007-.117c.126-.094.252-.192.372-.291a.07.07 0 0 1 .07-.01c3.927 1.793 8.18 1.793 12.061 0a.07.07 0 0 1 .072.009c.12.099.245.198.372.292a.07.07 0 0 1-.006.117c-.598.35-1.22.645-1.873.892a.07.07 0 0 0-.04.1c.36.698.772 1.362 1.225 1.993a.07.07 0 0 0 .078.028 19.84 19.84 0 0 0 6.002-3.03.08.08 0 0 0 .031-.055c.5-4.317-.838-8.067-3.549-11.407a.06.06 0 0 0-.03-.024zM8.02 13.331c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.211 0 2.176 1.096 2.157 2.42 0 1.333-.955 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.211 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);
const GithubIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2c-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.08 0 4.41-2.69 5.38-5.25 5.67.41.35.78 1.05.78 2.12v3.14c0 .31.21.68.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z" />
  </svg>
);

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
        <img src="/icons/other/trade.png" alt="" width={52} height={52} />

        <span>Quick Play</span>
        <span class={styles.playArrow}>
          <ArrowIcon size={30} />
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
          <span>Warmup</span>
        </Button>
        <Button
          block
          class={`${styles.modeBtn} ${styles.partyBtn}`}
          onClick={p.onParty}
        >
          <img src="/icons/other/friend.png" alt="" width={52} height={52} />
          <span>Party</span>
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

/* ------------------------- bottom bar (footer) ------------------------- */
interface FooterProps {
  server: GameServerInfo | undefined;
  onOpenServers: () => void;
}

export function Footer({ server, onOpenServers }: FooterProps) {
  const meta = server
    ? server.online === false
      ? "offline"
      : `${server.players ?? 0} playing`
    : "no server";

  return (
    <div class={styles.footer}>
      <div class={styles.footerLeft}>
        <div class={styles.social}>
          <a
            class={styles.socialBtn}
            href="#"
            title="Twitter"
            onClick={(e) => e.preventDefault()}
          >
            <XIcon size={15} />
          </a>
          <a
            class={styles.socialBtn}
            href="#"
            title="Discord"
            onClick={(e) => e.preventDefault()}
          >
            <DiscordIcon size={16} />
          </a>
          <a
            class={styles.socialBtn}
            href="#"
            title="GitHub"
            onClick={(e) => e.preventDefault()}
          >
            <GithubIcon size={16} />
          </a>
        </div>
        <span class={styles.credit}>
          made with <Heart size={12} fill="currentColor" /> by hxtnv
        </span>
      </div>

      <div class={styles.serverPick}>
        <div class={styles.serverInfo}>
          <span class={styles.serverName}>{server?.name ?? "—"}</span>
          <span class={styles.serverMeta}>{meta}</span>
        </div>
        <Button variant="secondary" size="small" onClick={onOpenServers}>
          <ServerIcon size={15} /> Change
        </Button>
      </div>
    </div>
  );
}
