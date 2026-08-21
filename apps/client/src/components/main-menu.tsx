import { useEffect, useState } from "preact/hooks";
import {
  ensureAuth,
  fetchServers,
  renameUser,
  shuffleName,
  type GameServerInfo,
  type User,
} from "../auth";
import { Box, Modal } from "./ui";
import {
  Footer,
  FriendsRail,
  NewsFloat,
  PlayButtons,
  PlayerCard,
  TopBar,
} from "./menu/panels";
import {
  LeaderboardModal,
  RewardsModal,
  ServerModal,
  SettingsModal,
  EditProfileModal,
} from "./menu/modals";
import { MOCK_NEWS } from "./menu/mock";
import styles from "./menu/menu.module.css";

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
  | null;

export function MainMenu({ onPlay }: Props) {
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
        if (alive) setError("Can't reach the server. Is it running?");
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
    <div class={styles.screen}>
      <div class="menu-scrim" />

      {error ? (
        <div class={styles.center}>
          <Box class={styles.notice}>{error}</Box>
        </div>
      ) : !user ? (
        <div class={styles.center}>
          <span class={styles.connecting}>Connecting…</span>
        </div>
      ) : (
        <div class={styles.hud}>
          <div class={styles.aTop}>
            <TopBar
              coins={1250}
              onLeaderboard={() => setModal("leaderboard")}
              onRewards={() => setModal("rewards")}
              onSettings={() => setModal("settings")}
            />
          </div>

          <div class={styles.aContent}>
            <div class={styles.mainBlock}>
              <NewsFloat onViewAll={() => setModal("news")} />
              <PlayButtons
                onQuickPlay={() => play()}
                onWarmup={() => play()}
                onParty={() => setModal("party")}
                ready={ready}
              />
              <div class={styles.sideCol}>
                <PlayerCard
                  user={user}
                  onEditProfile={() => setModal("profile")}
                />
                <FriendsRail onInvite={() => setModal("party")} />
              </div>
            </div>
          </div>

          <div class={styles.aBottom}>
            <Footer
              server={selected}
              onOpenServers={() => setModal("servers")}
            />
          </div>
        </div>
      )}

      <LeaderboardModal
        open={modal === "leaderboard"}
        onClose={() => setModal(null)}
      />
      <RewardsModal open={modal === "rewards"} onClose={() => setModal(null)} />
      <SettingsModal
        open={modal === "settings"}
        onClose={() => setModal(null)}
      />
      {user && (
        <EditProfileModal
          open={modal === "profile"}
          user={user}
          busy={busy}
          onClose={() => setModal(null)}
          onSave={saveName}
          onShuffle={shuffle}
        />
      )}
      <ServerModal
        open={modal === "servers"}
        onClose={() => setModal(null)}
        servers={servers}
        currentId={serverId}
        onSelect={setServerId}
      />
      <Modal
        open={modal === "party"}
        onClose={() => setModal(null)}
        title="Party"
        width={420}
      >
        <p style={{ margin: 0, color: "var(--ui-text-dim)" }}>
          Private lobbies &amp; friend invites are coming soon. For now, jump
          into a match with Quick Play!
        </p>
      </Modal>
      <Modal
        open={modal === "news"}
        onClose={() => setModal(null)}
        title="News"
        width={480}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {MOCK_NEWS.map((n) => (
            <div key={n.title}>
              <div style={{ fontFamily: "var(--ui-font)", fontWeight: 600 }}>
                {n.title}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "var(--ui-text-dim)",
                  margin: "2px 0 4px",
                }}
              >
                {n.date}
              </div>
              <div
                style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)" }}
              >
                {n.body}
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
