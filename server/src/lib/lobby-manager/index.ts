import {
  playerMoveStart,
  playerMoveEnd,
  updatePlayerPosition,
} from "./player-movement";
import {
  getAll,
  getAllLive,
  get,
  getClientLobby,
  removeClient,
  addClient,
} from "./state";
import { create } from "./create";
import { join } from "./join";
import { removeClientFromLobbies, removeLobby } from "./remove";
import { chatMessage } from "./chat";
import { registerBallHit, updateStatus } from "./utility";

const lobbyManager = () => {
  return {
    playerMoveStart,
    playerMoveEnd,
    updatePlayerPosition,
    getAll,
    getAllLive,
    get,
    getClientLobby,
    create,
    join,
    removeClientFromLobbies,
    chatMessage,
    registerBallHit,
    updateStatus,
    removeClient,
    addClient,
    removeLobby,
  };
};

const manager = lobbyManager();
Object.freeze(manager);

export default manager;
