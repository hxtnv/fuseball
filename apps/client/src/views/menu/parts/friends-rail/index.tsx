import { UserPlus } from "lucide-react";
import { Box, Button } from "@/components/ui";
import { cn } from "@/lib/cn";
import { MOCK_FRIENDS, type Friend } from "../../mock";
import styles from "./friends-rail.module.scss";

const statusLabel = (status: Friend["status"]) =>
  status === "in-game" ? "In game" : status === "online" ? "Online" : "Offline";

interface FriendsRailProps {
  onInvite: () => void;
}

export const FriendsRail = ({ onInvite }: FriendsRailProps) => {
  const onlineCount = MOCK_FRIENDS.filter((f) => f.status !== "offline").length;

  return (
    <Box class={styles.friendsRail}>
      <div class={styles.friendsRail__head}>
        <span>Friends</span>
        <span>{onlineCount} online</span>
      </div>

      <div class={styles.friendsRail__list}>
        {MOCK_FRIENDS.map((friend) => (
          <div class={styles.friendsRail__list__item} key={friend.name}>
            <span
              class={cn(
                styles.friendsRail__list__item__dot,
                styles[`friendsRail__list__item__dot--${friend.status}`],
              )}
            />
            <span class={styles.friendsRail__list__item__name}>
              {friend.name}
            </span>
            <span class={styles.friendsRail__list__item__status}>
              {statusLabel(friend.status)}
            </span>
          </div>
        ))}
      </div>

      <div class={styles.friendsRail__foot}>
        <Button
          block
          variant="secondary"
          size="small"
          iconOrientation="horizontal"
          iconSize={15}
          icon={<UserPlus />}
          onClick={onInvite}
        >
          Add friend
        </Button>
      </div>
    </Box>
  );
};
