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
  ping: number;
};

const createState = () =>
  ({
    players: [],
    controllablePlayer: null,
    followingPlayer: null,
    currentLobby: null,
    ping: 0,
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
    // initial request
    state.currentLobby = data;

    const mainPlayer = data.players.find((player) => player.id === playerId);

    if (mainPlayer) {
      state.controllablePlayer = new ControllablePlayer(p5, {
        id: mainPlayer.id,
        name: mainPlayer.name,
        emoji: mainPlayer.emoji,
        team: mainPlayer.team,
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
            team: player.team,
            position: {
              x: Math.random() * 1000,
              y: Math.random() * 500,
            },
          })
      );
  };

  const onPingReceived = (ping: number) => {
    console.log("game received ping", ping);
    state.ping = ping;
  };

  const init = () => {
    console.log("game init (listeners start)");
    emitter.on("game:current-lobby", onGetCurrentLobby);
    emitter.on("game:ping", onPingReceived);

    emitter.emit("game:get-current-lobby");
  };

  const cleanup = () => {
    console.log("game cleanup (listeners end)");
    emitter.off("game:current-lobby", onGetCurrentLobby);
    emitter.off("game:ping", onPingReceived);
  };

  return {
    init,
    cleanup,
    state,
  };
};

export default stateMachine;
