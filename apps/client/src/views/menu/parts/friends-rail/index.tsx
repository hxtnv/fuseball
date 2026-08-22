import { UserPlus } from "lucide-react";
import { Avatar, Box, Button } from "@/components/ui";
import { MOCK_FRIENDS, type Friend } from "../../mock";
import styles from "./friends-rail.module.scss";

const statusLabel = (status: Friend["status"]) =>
  status === "in-game"
    ? "In a match"
    : status === "online"
      ? "Online"
      : "Offline";

const statusOrder: Record<Friend["status"], number> = {
  "in-game": 0,
  online: 1,
  offline: 2,
};

interface FriendsRailProps {
  onInvite: () => void;
}

export const FriendsRail = ({ onInvite }: FriendsRailProps) => {
  const friends = [...MOCK_FRIENDS].sort(
    (a, b) => statusOrder[a.status] - statusOrder[b.status],
  );
  const onlineCount = MOCK_FRIENDS.filter((f) => f.status !== "offline").length;

  return (
    <Box class={styles.friendsRail}>
      <div class={styles.friendsRail__head}>
        <span>Friends</span>
        <span class={styles.friendsRail__head__count}>
          {onlineCount}/{MOCK_FRIENDS.length} online
        </span>
      </div>

      <div class={styles.friendsRail__list}>
        {friends.map((friend) => (
          <div
            class={styles.friendsRail__list__item}
            key={friend.name}
            data-status={friend.status}
          >
            <Avatar name={friend.name} onlineStatus={friend.status} />

            <span class={styles.friendsRail__list__item__info}>
              <span class={styles.friendsRail__list__item__info__name}>
                {friend.name}
              </span>
              <span class={styles.friendsRail__list__item__info__status}>
                {statusLabel(friend.status)}
              </span>
            </span>

            {friend.status === "in-game" && (
              <Button size="small" onClick={onInvite}>
                Join
              </Button>
            )}
          </div>
        ))}
      </div>

      <div class={styles.friendsRail__foot}>
        <Button
          block
          variant="secondary"
          size="small"
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
