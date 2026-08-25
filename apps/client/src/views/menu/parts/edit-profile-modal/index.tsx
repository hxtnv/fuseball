import { Dices, Store, User as UserIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "preact/hooks";
import { EMOJIS, generateName } from "@fuseball/shared";
import { Button, Input, Modal } from "@/components/ui";
import type { User } from "@/lib/auth";
import { EmojiTile } from "../emoji-tile";
import styles from "./edit-profile-modal.module.scss";

interface EditProfileModalProps {
  open: boolean;
  user: User;
  busy: boolean;
  onClose: () => void;
  onSave: (name: string, skin: string) => void;
  onOpenStore: () => void;
}

export const EditProfileModal = ({
  open,
  user,
  busy,
  onClose,
  onSave,
  onOpenStore,
}: EditProfileModalProps) => {
  const [name, setName] = useState(user.name);
  const [skin, setSkin] = useState(user.skin);

  // reset drafts to the current profile whenever the modal opens
  useEffect(() => {
    if (open) {
      setName(user.name);
      setSkin(user.skin);
    }
  }, [open, user.name, user.skin]);

  // owned emojis first (by price), then locked ones (by price)
  const emojis = useMemo(() => {
    const owned = new Set(user.ownedSkins);
    return [...EMOJIS].sort((a, b) => {
      const rank = Number(owned.has(b.slug)) - Number(owned.has(a.slug));
      return rank || a.price - b.price;
    });
  }, [user.ownedSkins]);

  const dirty = name !== user.name || skin !== user.skin;
  const ownedSet = new Set(user.ownedSkins);

  return (
    <Modal
      open={open}
      onClose={onClose}
      width={420}
      title={{ text: "Edit profile", icon: <UserIcon /> }}
    >
      <div class={styles.editProfile}>
        <Input
          label="Display name"
          value={name}
          onValue={setName}
          maxLength={16}
          autoFocus
          onEnter={() => dirty && onSave(name, skin)}
          extra={<Dices size={18} />}
          onExtraClick={() => setName(generateName())}
        />

        <div class={styles.editProfile__field}>
          <span class={styles.editProfile__label}>Emoji</span>
          <div class={styles.editProfile__grid}>
            {emojis.map((e) => {
              const owned = ownedSet.has(e.slug);
              return owned ? (
                <EmojiTile
                  key={e.slug}
                  slug={e.slug}
                  label={e.label}
                  selected={e.slug === skin}
                  onClick={() => setSkin(e.slug)}
                />
              ) : (
                <EmojiTile
                  key={e.slug}
                  slug={e.slug}
                  label={e.label}
                  price={e.price}
                  locked
                  overlay={{ icon: <Store size={13} />, label: "Store" }}
                  onClick={onOpenStore}
                />
              );
            })}
          </div>
        </div>

        <div class={styles.editProfile__actions}>
          <Button variant="secondary" size="small" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="small"
            loading={busy}
            disabled={!dirty}
            onClick={() => onSave(name, skin)}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  );
};
