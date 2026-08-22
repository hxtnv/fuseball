import { LogIn } from "lucide-react";
import { Button, Modal } from "@/components/ui";
import styles from "./sign-in-modal.module.scss";

interface SignInModalProps {
  open: boolean;
  onClose: () => void;
}

export const SignInModal = ({ open, onClose }: SignInModalProps) => (
  <Modal
    open={open}
    onClose={onClose}
    width={420}
    title={{ text: "Sign in", icon: <LogIn /> }}
  >
    <p class={styles.signIn__text}>
      Accounts are coming soon — sign in to sync your stats, cosmetics and
      progress across devices.
    </p>
    <div class={styles.signIn__actions}>
      <Button block variant="secondary" disabled>
        Google
      </Button>
      <Button block variant="secondary" disabled>
        Discord
      </Button>
    </div>
  </Modal>
);
