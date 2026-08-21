import { useCallback, useEffect, useState } from "preact/hooks";
import {
  ensureAuth,
  fetchRooms,
  fetchServers,
  renameUser,
  shuffleName,
  type GameServerInfo,
  type RoomInfo,
  type User,
} from "../auth";

export interface PlaySession {
  serverName: string;
  wsUrl: string; // base ws url of the chosen server
  token: string;
  roomId?: string; // undefined = quick play
}

interface Props {
  onPlay: (session: PlaySession) => void;
}

export function MainMenu({ onPlay }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string>("");
  const [servers, setServers] = useState<GameServerInfo[]>([]);
  const [serverId, setServerId] = useState<string>("");
  const [rooms, setRooms] = useState<RoomInfo[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [busy, setBusy] = useState(false);

  const loadRooms = useCallback(async (id: string) => {
    if (!id) return;
    setRoomsLoading(true);
    try {
      setRooms(await fetchRooms(id));
    } catch {
      setRooms([]);
    } finally {
      setRoomsLoading(false);
    }
  }, []);

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
        const first = list[0]?.id ?? "";
        setServerId(first);
        void loadRooms(first);
      } catch {
        if (alive) setError("Can't reach the server. Is it running?");
      }
    })();
    return () => {
      alive = false;
    };
  }, [loadRooms]);

  const selected = servers.find((s) => s.id === serverId);

  // keep the room list (and player counts) fresh while sitting in the menu
  useEffect(() => {
    if (!serverId) return;
    const t = setInterval(() => {
      void loadRooms(serverId);
      fetchServers()
        .then(setServers)
        .catch(() => {});
    }, 3000);
    return () => clearInterval(t);
  }, [serverId, loadRooms]);

  const play = (roomId?: string) => {
    if (!selected || !token) return;
    onPlay({
      serverName: selected.name,
      wsUrl: selected.wsUrl,
      token,
      roomId,
    });
  };

  const saveName = async () => {
    if (!token) return;
    setBusy(true);
    try {
      const { token: t, user: u } = await renameUser(token, nameDraft);
      setToken(t);
      setUser(u);
      setEditing(false);
    } catch {
      /* keep editing on failure */
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
    <div class="menu">
      <div class="menu-card">
        <h1 class="menu-title">FUSEBALL</h1>

        {error && <p class="menu-error">{error}</p>}

        {!user && !error && <p class="menu-dim">Connecting…</p>}

        {user && (
          <>
            <div class="menu-profile">
              {editing ? (
                <div class="menu-name-edit">
                  <input
                    class="menu-input"
                    value={nameDraft}
                    maxLength={16}
                    onInput={(e) =>
                      setNameDraft((e.target as HTMLInputElement).value)
                    }
                    onKeyDown={(e) => e.key === "Enter" && void saveName()}
                    autoFocus
                  />
                  <button
                    class="menu-btn sm"
                    disabled={busy}
                    onClick={saveName}
                  >
                    Save
                  </button>
                  <button
                    class="menu-btn sm ghost"
                    onClick={() => setEditing(false)}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div class="menu-name-row">
                  <span class="menu-name">{user.name}</span>
                  <button
                    class="menu-btn sm ghost"
                    title="Edit name"
                    onClick={() => {
                      setNameDraft(user.name);
                      setEditing(true);
                    }}
                  >
                    ✎
                  </button>
                  <button
                    class="menu-btn sm ghost"
                    title="Random name"
                    disabled={busy}
                    onClick={shuffle}
                  >
                    🎲
                  </button>
                </div>
              )}
              <div class="menu-stats">
                <span>{user.gamesPlayed} played</span>
                <span>{user.wins} wins</span>
                <span>{user.goals} goals</span>
              </div>
            </div>

            <label class="menu-field">
              <span class="menu-label">Server</span>
              <select
                class="menu-select"
                value={serverId}
                onChange={(e) => {
                  const id = (e.target as HTMLSelectElement).value;
                  setServerId(id);
                  void loadRooms(id);
                }}
              >
                {servers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} · {s.region} ·{" "}
                    {s.online === false
                      ? "offline"
                      : `${s.players ?? 0} playing`}
                  </option>
                ))}
              </select>
            </label>

            <button class="menu-btn play" onClick={() => play()}>
              ▶ Quick Play
            </button>

            <div class="menu-rooms">
              <div class="menu-rooms-head">
                <span class="menu-label">Rooms</span>
                <button
                  class="menu-btn sm ghost"
                  onClick={() => void loadRooms(serverId)}
                >
                  ⟳
                </button>
              </div>
              {roomsLoading ? (
                <p class="menu-dim">Loading…</p>
              ) : rooms.length === 0 ? (
                <p class="menu-dim">
                  No rooms yet — start one with Quick Play.
                </p>
              ) : (
                <ul class="menu-room-list">
                  {rooms.map((r) => {
                    const full = r.players >= r.max;
                    return (
                      <li key={r.id} class="menu-room">
                        <span class="menu-room-id">{r.id}</span>
                        <span class="menu-room-meta">
                          {r.players}/{r.max} · {r.status}
                        </span>
                        <button
                          class="menu-btn sm"
                          disabled={full}
                          onClick={() => play(r.id)}
                        >
                          {full ? "Full" : "Join"}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
