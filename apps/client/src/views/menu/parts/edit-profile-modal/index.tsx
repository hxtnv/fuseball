import { Dices, User as UserIcon } from "lucide-react";
import { useEffect, useState } from "preact/hooks";
import { Button, Input, Modal } from "@/components/ui";
import type { User } from "@/lib/auth";
import styles from "./edit-profile-modal.module.scss";

interface EditProfileModalProps {
  open: boolean;
  user: User;
  busy: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  onShuffle: () => void;
}

export const EditProfileModal = ({
  open,
  user,
  busy,
  onClose,
  onSave,
  onShuffle,
}: EditProfileModalProps) => {
  const [name, setName] = useState(user.name);

  // reset the draft to the current name whenever the modal opens
  useEffect(() => {
    if (open) setName(user.name);
  }, [open, user.name]);

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
          onEnter={() => onSave(name)}
          extra={<Dices size={18} />}
          onExtraClick={onShuffle}
        />
        <div class={styles.editProfile__actions}>
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
};
