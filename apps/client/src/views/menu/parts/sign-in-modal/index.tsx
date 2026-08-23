import { LogIn } from "lucide-react";
import { Button, Modal } from "@/components/ui";
import { googleSignInUrl, type User } from "@/lib/auth";
import styles from "./sign-in-modal.module.scss";

interface SignInModalProps {
  open: boolean;
  onClose: () => void;
  token: string;
  user: User | null;
}

export const SignInModal = ({
  open,
  onClose,
  token,
  user,
}: SignInModalProps) => {
  const signedIn = user != null && !user.isAnonymous;

  return (
    <Modal
      open={open}
      onClose={onClose}
      width={420}
      title={{ text: "Sign in", icon: <LogIn /> }}
    >
      {signedIn ? (
        <p class={styles.signIn__text}>
          You're signed in as <strong>{user?.name}</strong>. Your stats and
          progress are saved to your account.
        </p>
      ) : (
        <>
          <p class={styles.signIn__text}>
            Sign in to keep your stats, cosmetics and progress across devices —
            your current progress carries over.
          </p>
          <div class={styles.signIn__actions}>
            <Button
              block
              variant="secondary"
              onClick={() => {
                window.location.href = googleSignInUrl(token);
              }}
            >
              Google
            </Button>
            <Button block variant="secondary" disabled>
              Discord
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
};
