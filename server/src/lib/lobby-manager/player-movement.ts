import { getClientLobby, getState, setState } from "./state";
import calculateNewPlayerPosition from "../helpers/calculate-new-player-position";
import { PlayerData } from "../../types/player";

const INTERPOLATION_INTERVAL = 100; // milliseconds

export const playerMoveStart = (direction: string, playerData: PlayerData) => {
  const state = getState();
  const { lobby: existingLobby } = getClientLobby(playerData.id);

  if (!existingLobby) {
    return;
  }

  state.lobbiesLive[existingLobby.id].playersMovement[playerData.id][
    direction
  ] = true;

  setState(state);
};

export const playerMoveEnd = (direction: string, playerData: PlayerData) => {
  const state = getState();
  const { lobby: existingLobby } = getClientLobby(playerData.id);

  if (!existingLobby) {
    return;
  }

  state.lobbiesLive[existingLobby.id].playersMovement[playerData.id][
    direction
  ] = false;

  setState(state);
};

export const updatePlayerPosition = ({
  lobbyId,
  playerId,
}: {
  lobbyId: string;
  playerId: number;
}) => {
  const state = getState();
  const lobbyState = state.lobbiesLive[lobbyId];
  const movement = lobbyState.playersMovement[playerId] ?? {};

  // if (!movement || !Object.values(movement).includes(true)) {
  //   return;
  // }

  state.lobbiesLive[lobbyId].players = lobbyState.players.map((player) => {
    if (player.id === playerId) {
      const { newPosition, newBallPosition, didBallMove } =
        calculateNewPlayerPosition({
          player,
          movement,
          allPlayers: lobbyState.players,
          ball: lobbyState.ball,
          state,
          lobbyId,
        });

      // Apply interpolation logic here for player
      player.lastPositionUpdateTime =
        player.lastPositionUpdateTime || Date.now();

      const elapsedTime = Date.now() - player.lastPositionUpdateTime;

      if (elapsedTime < INTERPOLATION_INTERVAL) {
        const t = elapsedTime / INTERPOLATION_INTERVAL;
        player.position.x += t * (newPosition.x - player.position.x);
        player.position.y += t * (newPosition.y - player.position.y);
      } else {
        player.position.x = newPosition.x;
        player.position.y = newPosition.y;
      }

      player.lastPositionUpdateTime = Date.now();

      if (didBallMove) {
        lobbyState.roundStatus = "live";
        lobbyState.ball.lastTouchedBy = player.id;
      }

      return {
        ...player,
        position: player.position,
      };
    }

    return player;
  });

  setState(state);
};
