import { LobbyPlayerLive } from "../lobby-manager";
import PLAYER from "../const/player";
import MAP from "../const/map";

type Props = {
  player: LobbyPlayerLive;
  movement: Record<string, boolean>;
  allPlayers: LobbyPlayerLive[];
};

const calculateNewPlayerPosition = ({
  player,
  movement,
  allPlayers,
}: Props) => {
  const newPosition = { ...player.position };

  if (movement.up) {
    newPosition.y -= PLAYER.SPEED;
  }

  if (movement.down) {
    newPosition.y += PLAYER.SPEED;
  }

  if (movement.left) {
    newPosition.x -= PLAYER.SPEED;
  }

  if (movement.right) {
    newPosition.x += PLAYER.SPEED;
  }

  // Goal zone dimensions
  const goalZoneWidth =
    MAP.FIELD_WIDTH * MAP.GOAL_ZONE_WIDTH_RATIO - PLAYER.SIZE / 2;
  const goalZoneHeight = MAP.FIELD_HEIGHT * MAP.GOAL_ZONE_HEIGHT_RATIO;

  const centerY = MAP.FIELD_HEIGHT / 2;
  const goalZoneTopY = centerY - goalZoneHeight / 2;
  const goalZoneBottomY = centerY + goalZoneHeight / 2;

  // Set up bounds
  if (
    (newPosition.x < goalZoneWidth &&
      newPosition.y >= goalZoneTopY &&
      newPosition.y <= goalZoneBottomY) ||
    (newPosition.x > MAP.FIELD_WIDTH - goalZoneWidth &&
      newPosition.y >= goalZoneTopY &&
      newPosition.y <= goalZoneBottomY)
  ) {
    // Allow movement in the goal zones
    newPosition.x = Math.max(
      -goalZoneWidth,
      Math.min(MAP.FIELD_WIDTH + goalZoneWidth, newPosition.x)
    );
    newPosition.y = Math.max(
      PLAYER.SIZE / 2,
      Math.min(MAP.FIELD_HEIGHT - PLAYER.SIZE / 2, newPosition.y)
    );
  } else {
    // Normal bounds for the main field
    newPosition.x = Math.max(
      PLAYER.SIZE / 2,
      Math.min(MAP.FIELD_WIDTH - PLAYER.SIZE / 2, newPosition.x)
    );
    newPosition.y = Math.max(
      PLAYER.SIZE / 2,
      Math.min(MAP.FIELD_HEIGHT - PLAYER.SIZE / 2, newPosition.y)
    );
  }

  // Don't collide with other players
  // Adjust collision logic to account for both main field and goal zones
  /*
  allPlayers.forEach((otherPlayer) => {
    if (otherPlayer.id !== player.id) {
      if (
        otherPlayer.position.x < newPosition.x + PLAYER.SIZE / 2 &&
        otherPlayer.position.x + PLAYER.SIZE / 2 > newPosition.x &&
        otherPlayer.position.y < newPosition.y + PLAYER.SIZE / 2 &&
        otherPlayer.position.y + PLAYER.SIZE / 2 > newPosition.y
      ) {
        // Correct the position to avoid collision
        newPosition.x = player.position.x;
        newPosition.y = player.position.y;
      }
    }
  });*/

  return newPosition;
};

export default calculateNewPlayerPosition;
