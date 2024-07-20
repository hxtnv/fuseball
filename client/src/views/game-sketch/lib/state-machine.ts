import Player from "../classes/player";
import ControllablePlayer from "../classes/controllable-player";
import { Lobby } from "@/context/game.context";
import emitter from "@/lib/emitter";

export type StateType = {
  players: Player[];
  controllablePlayer: ControllablePlayer | null;
  currentLobby: Lobby | null;
};

const stateMachine = () => {
  const players: StateType["players"] = [];
  let controllablePlayer: StateType["controllablePlayer"] = null;
  // const controllablePlayer: StateType["controllablePlayer"] =
  // new ControllablePlayer(p, {
  //   position: {
  //     x: 1440 / 2,
  //     y: 792 / 2,
  //   },
  // });
  let currentLobby: StateType["currentLobby"] = null;

  const onGetCurrentLobby = ({ data }: { data: Lobby }) => {
    console.log("game got current lobby received", data);
    currentLobby = data;
  };

  const init = () => {
    console.log("stateMachine.init");
    emitter.on("game:current-lobby", onGetCurrentLobby);

    emitter.emit("game:get-current-lobby");
  };

  const cleanup = () => {
    emitter.off("game:get-current-lobby", onGetCurrentLobby);
  };

  return {
    init,
    cleanup,
    state: {
      players,
      controllablePlayer,
      currentLobby,
    } as StateType,
  };
};

// const state = stateMachine();
// Object.freeze(state);

export default stateMachine;
