import { PlayerData } from "../../types/player";
import { getClientLobby, getState, setState } from "./state";

export const removeClientFromLobbies = (playerData: PlayerData) => {
  const state = getState();
  const { lobby, player } = getClientLobby(playerData.id);

  if (!lobby || !player) return;

  state.lobbies = state.lobbies.map((lobby) => ({
    ...lobby,
    players: lobby.players.filter((player) => player.id !== playerData.id),
  }));

  state.lobbiesLive[lobby.id].players = state.lobbiesLive[
    lobby.id
  ].players.filter((player) => player.id !== playerData.id);

  console.log(
    `Player "${player.name}" has left the lobby "${lobby.name}" (${
      lobby.players.length - 1
    }/${lobby.teamSize * 2})`
  );

  setState(state);

  if (state.lobbiesLive[lobby.id].players.length === 0) {
    removeLobby(lobby.id);
  }
};

export const removeLobby = (lobbyId: string) => {
  const state = getState();
  const lobbyDetails = state.lobbies.find((lobby) => lobby.id === lobbyId);

  state.lobbies = state.lobbies.filter((lobby) => lobby.id !== lobbyId);
  delete state.lobbiesLive[lobbyId];

  console.log(`Lobby "${lobbyDetails?.name}" has been removed`);

  setState(state);
};
