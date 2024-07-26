import { getClientLobby, getState, setState } from "./state";
import calculateNewPlayerPosition from "../helpers/calculate-new-player-position";

export const playerMoveStart = (direction: string, playerId: string) => {
  const state = getState();
  const { lobby: existingLobby } = getClientLobby(playerId);

  if (!existingLobby) {
    return;
  }

  state.lobbiesLive[existingLobby.id].playersMovement[playerId][direction] =
    true;

  setState(state);
};

export const playerMoveEnd = (direction: string, playerId: string) => {
  const state = getState();
  const { lobby: existingLobby } = getClientLobby(playerId);

  if (!existingLobby) {
    return;
  }

  state.lobbiesLive[existingLobby.id].playersMovement[playerId][direction] =
    false;

  setState(state);
};

export const updatePlayerPosition = ({
  lobbyId,
  playerId,
}: {
  lobbyId: string;
  playerId: string;
}) => {
  const state = getState();
  const lobbyState = state.lobbiesLive[lobbyId];
  const movement = lobbyState.playersMovement[playerId];
  if (!movement || !Object.values(movement).includes(true)) {
    return;
  }

  state.lobbiesLive[lobbyId].players = lobbyState.players.map(
    (player, index, playersLive) => {
      if (player.id === playerId) {
        const { newPosition, newBallPosition, didBallMove } =
          calculateNewPlayerPosition({
            player,
            movement,
            allPlayers: playersLive,
            ball: lobbyState.ball,
            state,
            lobbyId,
          });

        if (didBallMove) {
          lobbyState.roundStatus = "live";
        }

        lobbyState.ball.position = newBallPosition;

        return {
          ...player,
          position: newPosition,
        };
      }

      return player;
    }
  );

  setState(state);
};
