import { getClientLobby, getState, setState } from "./state";

export const removeClientFromLobbies = (playerId: string) => {
  const state = getState();
  const { lobby, player } = getClientLobby(playerId);

  if (!lobby || !player) return;

  state.lobbies = state.lobbies
    .map((lobby) => ({
      ...lobby,
      players: lobby.players.filter((player) => player.id !== playerId),
    }))
    .filter((lobby) => lobby.players.length > 0);

  state.lobbiesLive[lobby.id].players = state.lobbiesLive[
    lobby.id
  ].players.filter((player) => player.id !== playerId);

  // todo: remove state.lobbiesLive entry if no players left

  console.log(
    `Player "${player.name}" has left the lobby "${lobby.name}" (${
      lobby.players.length - 1
    }/${lobby.teamSize * 2})`
  );

  setState(state);
};
