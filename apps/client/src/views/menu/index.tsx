import { useEffect, useState } from "preact/hooks";
import {
  ensureAuth,
  fetchServers,
  renameUser,
  shuffleName,
  type GameServerInfo,
  type User,
} from "@/lib/auth";
import { AlertTriangle } from "lucide-react";
import { TopBar } from "./parts/top-bar";
import { ServerBox } from "./parts/server-box";
import { NewsCard } from "./parts/news-card";
import { PlayButtons } from "./parts/play-buttons";
import { PlayerCard } from "./parts/player-card";
import { FriendsRail } from "./parts/friends-rail";
import { Footer } from "./parts/footer";
import { LeaderboardCard } from "./parts/leaderboard-card";
import { WalletStrip } from "./parts/wallet-strip";
import { LeaderboardModal } from "./parts/leaderboard-modal";
import { RewardsModal } from "./parts/rewards-modal";
import { SettingsModal } from "./parts/settings-modal";
import { EditProfileModal } from "./parts/edit-profile-modal";
import { ServerModal } from "./parts/server-modal";
import { PartyModal } from "./parts/party-modal";
import { NewsModal } from "./parts/news-modal";
import { SignInModal } from "./parts/sign-in-modal";
import { useServersPing } from "./hooks/use-servers-ping";
import styles from "./menu.module.scss";

export interface PlaySession {
  serverName: string;
  wsUrl: string; // base ws url of the chosen server
  token: string;
  roomId?: string; // undefined = quick play
}

interface Props {
  onPlay: (session: PlaySession) => void;
}

type ModalKind =
  | "leaderboard"
  | "rewards"
  | "settings"
  | "party"
  | "servers"
  | "news"
  | "profile"
  | "signin"
  | null;

export const MainMenu = ({ onPlay }: Props) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState("");
  const [servers, setServers] = useState<GameServerInfo[]>([]);
  const [serverId, setServerId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [modal, setModal] = useState<ModalKind>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const auth = await ensureAuth();
        if (!alive) return;
        setUser(auth.user);
        setToken(auth.token);
        const list = await fetchServers();
        if (!alive) return;
        setServers(list);
        setServerId(list[0]?.id ?? "");
      } catch {
        if (alive)
          setError(
            "Failed to connect to the server. Please check your internet connection and try again.",
          );
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // keep the server player counts fresh while sitting in the menu
  useEffect(() => {
    const t = setInterval(() => {
      fetchServers()
        .then(setServers)
        .catch(() => {});
    }, 5000);
    return () => clearInterval(t);
  }, []);

  const selected = servers.find((s) => s.id === serverId);
  const ready = !!selected && !!token;
  const closeModal = () => setModal(null);
  const pings = useServersPing(servers);

  const play = (roomId?: string) => {
    if (!selected || !token) return;
    onPlay({
      serverName: selected.name,
      wsUrl: selected.wsUrl,
      token,
      roomId,
    });
  };

  const saveName = async (name: string) => {
    if (!token) return;
    setBusy(true);
    try {
      const { token: t, user: u } = await renameUser(token, name);
      setToken(t);
      setUser(u);
      setModal(null);
    } catch {
      /* keep the modal open on failure */
    } finally {
      setBusy(false);
    }
  };

  const shuffle = async () => {
    if (!token) return;
    setBusy(true);
    try {
      const { token: t, user: u } = await shuffleName(token);
      setToken(t);
      setUser(u);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div class={styles.menu}>
      <div class={styles.menu__bg}>
        <div class={styles.menu__bg__image} />
        <div class={styles.menu__bg__tint} />
        <div class={styles.menu__bg__noise} />
      </div>

      <div class={styles.menu__hud}>
        <div class={styles.menu__hud__top}>
          <TopBar
            onSignIn={() => setModal("signin")}
            onSettings={() => setModal("settings")}
          />
        </div>

        <div class={styles.menu__hud__content}>
          <div class={styles.menu__block}>
            {error && (
              <div class={styles.menu__alert}>
                <AlertTriangle size={18} />
                <span>{error}</span>
              </div>
            )}

            <div class={styles.menu__block__left}>
              <ServerBox
                server={selected}
                ping={selected ? pings[selected.id] : undefined}
                onOpen={() => setModal("servers")}
              />
              <LeaderboardCard onOpen={() => setModal("leaderboard")} />

              <NewsCard onViewAll={() => setModal("news")} />
            </div>

            <div class={styles.menu__block__center}>
              <PlayButtons
                onQuickPlay={() => play()}
                onWarmup={() => play()}
                onParty={() => setModal("party")}
                ready={ready}
              />
            </div>

            <div class={styles.menu__block__side}>
              <PlayerCard
                user={user}
                onEditProfile={() => setModal("profile")}
              />
              <WalletStrip coins={1250} onRewards={() => setModal("rewards")} />
              <FriendsRail onInvite={() => setModal("party")} />
            </div>
          </div>
        </div>

        <div class={styles.menu__hud__bottom}>
          <Footer />
        </div>
      </div>

      <LeaderboardModal open={modal === "leaderboard"} onClose={closeModal} />
      <RewardsModal open={modal === "rewards"} onClose={closeModal} />
      <SettingsModal open={modal === "settings"} onClose={closeModal} />
      {user && (
        <EditProfileModal
          open={modal === "profile"}
          user={user}
          busy={busy}
          onClose={closeModal}
          onSave={saveName}
          onShuffle={shuffle}
        />
      )}
      <ServerModal
        open={modal === "servers"}
        onClose={closeModal}
        servers={servers}
        pings={pings}
        currentId={serverId}
        onSelect={setServerId}
      />
      <PartyModal open={modal === "party"} onClose={closeModal} />
      <NewsModal open={modal === "news"} onClose={closeModal} />
      <SignInModal open={modal === "signin"} onClose={closeModal} />
    </div>
  );
};
