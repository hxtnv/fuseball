import p5 from "q5";
import Player from "../classes/player";
import ControllablePlayer from "../classes/controllable-player";
import type { Lobby, LobbyPlayerLive } from "@/context/game.context";
import emitter from "@/lib/emitter";

type LobbyMeta = {
  id: string;
  name: string;
  teamSize: number;
  countryCode: string;
};

type LobbyLive = {
  id: string;
  status: "warmup" | "in-progress" | "finished";
  name: string;
  players: LobbyPlayerLive[];
};

export type StateType = {
  players: Player[];
  controllablePlayer: ControllablePlayer | null;
  followingPlayer: Player | null;
  currentLobbyMeta: LobbyMeta | null;
  currentLobbyLive: LobbyLive | null;
  ping: number;
};

const createState = () =>
  ({
    players: [],
    controllablePlayer: null,
    followingPlayer: null,
    currentLobbyMeta: null,
    currentLobbyLive: null,
    ping: 0,
  } as StateType);

const stateMachine = (p5: p5) => {
  const state = createState();

  // this is the data we received from our react context
  // we will use it populate the non-crucial state like
  // the lobby name, and only then we will request the
  // current live lobby data from the server
  const onGetCurrentLobby = ({
    data,
    playerId,
  }: {
    data: Lobby;
    playerId: string;
  }) => {
    state.currentLobbyMeta = {
      id: data.id,
      name: data.name,
      teamSize: data.teamSize,
      countryCode: data.countryCode,
    };

    // const mainPlayer = data.players.find((player) => player.id === playerId);

    // if (mainPlayer) {
    //   state.controllablePlayer = new ControllablePlayer(p5, {
    //     id: mainPlayer.id,
    //     name: mainPlayer.name,
    //     emoji: mainPlayer.emoji,
    //     team: mainPlayer.team,
    //     position: {
    //       x: 700,
    //       y: 400,
    //     },
    //   });

    //   state.followingPlayer = state.controllablePlayer;
    // }

    // state.players = data.players
    //   .filter((player) => player.id !== playerId)
    //   .map(
    //     (player) =>
    //       new Player(p5, {
    //         id: player.id,
    //         name: player.name,
    //         emoji: player.emoji,
    //         team: player.team,
    //         position: {
    //           x: Math.random() * 1000,
    //           y: Math.random() * 500,
    //         },
    //       })
    //   );
  };

  const onPingReceived = (ping: number) => {
    state.ping = ping;
  };

  const onLobbyLiveUpdate = ({ data }: { data: LobbyLive }) => {
    console.log("live update", data);
    state.currentLobbyLive = data;
  };

  const init = () => {
    emitter.on("ws:message:lobby-live-update", onLobbyLiveUpdate);
    emitter.on("game:current-lobby-meta", onGetCurrentLobby);
    emitter.on("game:ping", onPingReceived);

    emitter.emit("game:get-current-lobby");
  };

  const cleanup = () => {
    emitter.off("ws:message:lobby-live-update", onLobbyLiveUpdate);
    emitter.off("game:current-lobby-meta", onGetCurrentLobby);
    emitter.off("game:ping", onPingReceived);
  };

  return {
    init,
    cleanup,
    state,
  };
};

export default stateMachine;
