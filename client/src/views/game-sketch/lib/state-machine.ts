import Player from "../classes/player";
import ControllablePlayer from "../classes/controllable-player";
import { Lobby } from "@/context/game.context";
import emitter from "@/lib/emitter";

export type StateType = {
  players: Player[];
  controllablePlayer: ControllablePlayer | null;
  currentLobby: Lobby | null;
};

const createState = () =>
  ({
    players: [],
    controllablePlayer: null,
    currentLobby: null,
  } as StateType);

const stateMachine = () => {
  const state = createState();

  const onGetCurrentLobby = ({ data }: { data: Lobby }) => {
    console.log("game got current lobby received", data);
    state.currentLobby = data;
  };

  const init = () => {
    emitter.on("game:current-lobby", onGetCurrentLobby);
    emitter.emit("game:get-current-lobby");
  };

  const cleanup = () => {
    emitter.off("game:current-lobby", onGetCurrentLobby);
  };

  return {
    init,
    cleanup,
    state,
  };
};

export default stateMachine;
