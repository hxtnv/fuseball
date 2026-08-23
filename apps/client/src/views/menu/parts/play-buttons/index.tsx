import { PlayIcon } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/cn";
import styles from "./play-buttons.module.scss";

interface PlayButtonsProps {
  onQuickPlay: () => void;
  onWarmup: () => void;
  onParty: () => void;
  ready: boolean;
  online: number;
  servers: number;
}

export const PlayButtons = ({
  onQuickPlay,
  onWarmup,
  onParty,
  ready,
  online,
  servers,
}: PlayButtonsProps) => (
  <div class={styles.playButtons}>
    <Button
      block
      size="large"
      iconSize={60}
      icon={<img src="/icons/other/trade.png" alt="" />}
      iconAfter={<PlayIcon />}
      class={styles.playButtons__quick}
      onClick={onQuickPlay}
      disabled={!ready}
    >
      Quick Play
    </Button>

    <div class={styles.playButtons__modes}>
      <Button
        block
        iconOrientation="vertical"
        iconSize={52}
        icon={<img src="/icons/other/target.png" alt="" />}
        iconAfter={<PlayIcon />}
        class={cn(
          styles.playButtons__mode,
          styles["playButtons__mode--warmup"],
        )}
        onClick={onWarmup}
        disabled={!ready}
      >
        Warmup
      </Button>
      <Button
        block
        iconOrientation="vertical"
        iconSize={52}
        icon={<img src="/icons/other/friend.png" alt="" />}
        iconAfter={<PlayIcon />}
        class={cn(styles.playButtons__mode, styles["playButtons__mode--party"])}
        onClick={onParty}
        disabled={!ready}
      >
        Party
      </Button>
    </div>

    <div class={styles.playButtons__online}>
      <span class={styles.playButtons__online__item}>
        <span class={styles.playButtons__online__dot} />
        <span>
          <strong>{online.toLocaleString()}</strong> players online
        </span>
      </span>
      <span class={styles.playButtons__online__item}>
        <strong>{servers.toLocaleString()}</strong> servers available
      </span>
    </div>
  </div>
);
