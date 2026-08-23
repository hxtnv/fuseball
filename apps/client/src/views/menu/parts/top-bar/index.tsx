import { LogIn, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/cn";
import styles from "./top-bar.module.scss";

interface TopBarProps {
  signedIn: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
  onSettings: () => void;
}

export const TopBar = ({
  signedIn,
  onSignIn,
  onSignOut,
  onSettings,
}: TopBarProps) => (
  <div class={styles.topBar}>
    <div class={styles.topBar__side} />

    <img class={styles.topBar__logo} src="/logo.png" alt="Fuseball" />

    <div class={cn(styles.topBar__side, styles["topBar__side--end"])}>
      {signedIn ? (
        <Button
          variant="secondary"
          iconSize={18}
          icon={<LogOut />}
          onClick={onSignOut}
        >
          Sign out
        </Button>
      ) : (
        <Button iconSize={18} icon={<LogIn />} onClick={onSignIn}>
          Sign in
        </Button>
      )}
      <Button
        variant="secondary"
        iconSize={18}
        icon={<Settings />}
        onClick={onSettings}
        title="Settings"
      />
    </div>
  </div>
);
