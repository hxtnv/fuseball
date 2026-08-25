import { useEffect, useState } from "preact/hooks";
import {
  consumeRedirectToken,
  ensureAuth,
  fetchServers,
  renameUser,
  selectEmoji,
  unlockEmoji,
  signOut,
  type GameServerInfo,
  type User,
} from "@/lib/auth";
import { AlertTriangle, LogOut } from "lucide-react";
import { Button, Modal } from "@/components/ui";
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
import { StoreModal } from "./parts/store-modal";
import { ServerModal } from "./parts/server-modal";
import { PartyModal } from "./parts/party-modal";
import { NewsModal } from "./parts/news-modal";
import { SignInModal } from "./parts/sign-in-modal";
import { useServersPing } from "./hooks/use-servers-ping";
import styles from "./menu.module.scss";
import { cn } from "@/lib/cn";

export interface PlaySession {
  serverName: string;
  wsUrl: string; // base ws url of the chosen server
  token: string;
  roomId?: string; // undefined = quick play
  skin?: string; // active emoji slug
  user?: User; // snapshot for the end-game screen (level, coins)
}

interface Props {
  onPlay: (session: PlaySession) => void;
  online: number;
  connected: boolean;
}

type ModalKind =
  | "leaderboard"
  | "rewards"
  | "settings"
  | "party"
  | "servers"
  | "news"
  | "profile"
  | "store"
  | "signin"
  | null;

export const MainMenu = ({ onPlay, online, connected }: Props) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState("");
  const [servers, setServers] = useState<GameServerInfo[]>([]);
  const [serverId, setServerId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [modal, setModal] = useState<ModalKind>(null);
  const [signOutOpen, setSignOutOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        consumeRedirectToken(); // pick up a token from a Google OAuth redirect
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
  const serversUp = servers.filter((s) => s.online).length;
  const closeModal = () => setModal(null);
  const pings = useServersPing(servers);

  const play = (roomId?: string) => {
    if (!selected || !token) return;
    onPlay({
      serverName: selected.name,
      wsUrl: selected.wsUrl,
      token,
      roomId,
      skin: user?.skin,
      user: user ?? undefined,
    });
  };

  // save name + emoji together; only the changed parts hit the API
  const saveProfile = async (name: string, skin: string) => {
    if (!token || !user) return;
    setBusy(true);
    try {
      let nextToken = token;
      let nextUser = user;
      if (name !== user.name) {
        const r = await renameUser(nextToken, name);
        nextToken = r.token;
        nextUser = r.user;
        setToken(r.token);
      }
      if (skin && skin !== user.skin) {
        nextUser = await selectEmoji(nextToken, skin);
      }
      setUser(nextUser);
      setModal(null);
    } catch {
      /* keep the modal open on failure */
    } finally {
      setBusy(false);
    }
  };

  // store: grant ownership, then (optionally) equip — parent owns user state
  const buyEmoji = async (slug: string) => {
    if (!token) return;
    setUser(await unlockEmoji(token, slug));
  };
  const equipEmoji = async (slug: string) => {
    if (!token) return;
    setUser(await selectEmoji(token, slug));
  };

  // sign out drops the token and provisions a fresh anonymous account
  const handleSignOut = async () => {
    setSignOutOpen(false);
    signOut();
    try {
      const auth = await ensureAuth();
      setUser(auth.user);
      setToken(auth.token);
    } catch {
      /* leave state as-is on failure */
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
            signedIn={user != null && !user.isAnonymous}
            onSignIn={() => setModal("signin")}
            onSignOut={() => setSignOutOpen(true)}
            onSettings={() => setModal("settings")}
          />
        </div>

        <div class={styles.menu__hud__content}>
          <div class={styles.menu__block}>
            {(error || !connected) && (
              <div class={cn(styles.menu__alert, "ui-box")}>
                <AlertTriangle size={18} />
                <span>{error ?? "Connection lost. Reconnecting…"}</span>
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
                online={online}
                servers={serversUp}
              />
            </div>

            <div class={styles.menu__block__side}>
              <PlayerCard
                user={user}
                connected={connected}
                onEditProfile={() => setModal("profile")}
              />
              <WalletStrip
                coins={user?.balance ?? 0}
                onStore={() => setModal("store")}
              />
              <FriendsRail onInvite={() => setModal("party")} />
            </div>
          </div>
        </div>

        <div class={styles.menu__hud__bottom}>
          <Footer isAdmin={user?.isAdmin} />
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
          onSave={saveProfile}
          onOpenStore={() => setModal("store")}
        />
      )}
      <StoreModal
        open={modal === "store"}
        user={user}
        onClose={closeModal}
        onBuy={buyEmoji}
        onEquip={equipEmoji}
      />
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
      <SignInModal
        open={modal === "signin"}
        onClose={closeModal}
        token={token}
        user={user}
      />

      <Modal
        open={signOutOpen}
        onClose={() => setSignOutOpen(false)}
        width={380}
        title={{ text: "Sign out?", icon: <LogOut /> }}
      >
        <p class={styles.menu__confirm}>
          You'll drop back to a guest account. Sign in again anytime to restore
          your progress.
        </p>
        <div class={styles.menu__confirm__actions}>
          <Button variant="secondary" onClick={() => setSignOutOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleSignOut}>
            Sign out
          </Button>
        </div>
      </Modal>
    </div>
  );
};
