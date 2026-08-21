import {
  Dices,
  Gift,
  Server as ServerIcon,
  Settings,
  Trophy,
  User as UserIcon,
} from "lucide-react";
import { useEffect, useState } from "preact/hooks";
import { Button, Input, Modal } from "../ui";
import type { GameServerInfo, User } from "../../auth";
import { MOCK_LEADERBOARD, MOCK_REWARDS } from "./mock";
import styles from "./menu.module.css";

export function LeaderboardModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <>
          <Trophy size={18} /> Leaderboard
        </>
      }
      width={460}
    >
      <div class={styles.lbTable}>
        {MOCK_LEADERBOARD.map((r) => (
          <div class={styles.lbRow} key={r.rank} data-top={r.rank <= 3}>
            <span class={styles.lbRank}>#{r.rank}</span>
            <span class={styles.lbName}>{r.name}</span>
            <span class={styles.lbStat}>{r.wins} wins</span>
            <span class={styles.lbStat}>{r.goals} goals</span>
          </div>
        ))}
      </div>
    </Modal>
  );
}

export function RewardsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <>
          <Gift size={18} /> Daily Rewards
        </>
      }
      width={460}
    >
      <div class={styles.rewardGrid}>
        {MOCK_REWARDS.map((r) => (
          <div
            class={styles.reward}
            key={r.day}
            data-today={r.today}
            data-claimed={r.claimed}
          >
            <span class={styles.rewardDay}>Day {r.day}</span>
            <span class={styles.rewardLabel}>{r.label}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: "16px" }}>
        <Button block>Claim today’s reward</Button>
      </div>
    </Modal>
  );
}

export function SettingsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <>
          <Settings size={18} /> Settings
        </>
      }
      width={420}
    >
      <div class={styles.settingRow}>
        <span class={styles.settingLabel}>Sound</span>
        <Button variant="secondary" size="small">
          On
        </Button>
      </div>
      <div class={styles.settingRow}>
        <span class={styles.settingLabel}>Graphics</span>
        <Button variant="secondary" size="small">
          Auto
        </Button>
      </div>
      <div class={styles.settingRow}>
        <span class={styles.settingLabel}>Account</span>
        <Button size="small">Sign in</Button>
      </div>
    </Modal>
  );
}

export function EditProfileModal({
  open,
  user,
  busy,
  onClose,
  onSave,
  onShuffle,
}: {
  open: boolean;
  user: User;
  busy: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  onShuffle: () => void;
}) {
  const [name, setName] = useState(user.name);

  // reset the draft to the current name whenever the modal opens
  useEffect(() => {
    if (open) setName(user.name);
  }, [open, user.name]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <>
          <UserIcon size={18} /> Edit profile
        </>
      }
      width={420}
    >
      <div class={styles.editProfile}>
        <Input
          label="Display name"
          value={name}
          onValue={setName}
          maxLength={16}
          autoFocus
          onEnter={() => onSave(name)}
          extra={<Dices size={18} />}
          onExtraClick={onShuffle}
        />
        <div class={styles.editProfileActions}>
          <Button variant="secondary" size="small" onClick={onClose}>
            Cancel
          </Button>
          <Button size="small" loading={busy} onClick={() => onSave(name)}>
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export function ServerModal({
  open,
  onClose,
  servers,
  currentId,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  servers: GameServerInfo[];
  currentId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <>
          <ServerIcon size={18} /> Choose a server
        </>
      }
      width={420}
    >
      <div class={styles.serverList}>
        {servers.map((s) => (
          <button
            key={s.id}
            class={styles.serverItem}
            data-active={s.id === currentId}
            onClick={() => {
              onSelect(s.id);
              onClose();
            }}
          >
            <span>
              {s.name} · {s.region}
            </span>
            <span class={styles.serverItemMeta}>
              {s.online === false ? "offline" : `${s.players ?? 0} playing`}
            </span>
          </button>
        ))}
      </div>
    </Modal>
  );
}
