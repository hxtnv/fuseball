import p5 from "q5";
import Player from "../classes/player";
import ControllablePlayer from "../classes/controllable-player";
import { Lobby } from "@/context/game.context";
import emitter from "@/lib/emitter";

export type StateType = {
  players: Player[];
  controllablePlayer: ControllablePlayer | null;
  followingPlayer: Player | null;
  currentLobby: Lobby | null;
};

const createState = () =>
  ({
    players: [],
    controllablePlayer: null,
    followingPlayer: null,
    currentLobby: null,
  } as StateType);

const stateMachine = (p5: p5) => {
  const state = createState();

  const onGetCurrentLobby = ({
    data,
    playerId,
  }: {
    data: Lobby;
    playerId: string;
  }) => {
    console.log("game got current lobby received", data);
    state.currentLobby = data;

    const mainPlayer = data.players.find((player) => player.id === playerId);

    if (mainPlayer) {
      state.controllablePlayer = new ControllablePlayer(p5, {
        id: mainPlayer.id,
        name: mainPlayer.name,
        emoji: mainPlayer.emoji,
        position: {
          x: 700,
          y: 400,
        },
      });

      state.followingPlayer = state.controllablePlayer;
    }

    state.players = data.players
      .filter((player) => player.id !== playerId)
      .map(
        (player) =>
          new Player(p5, {
            id: player.id,
            name: player.name,
            emoji: player.emoji,
            position: {
              x: Math.random() * 1000,
              y: Math.random() * 500,
            },
          })
      );
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
