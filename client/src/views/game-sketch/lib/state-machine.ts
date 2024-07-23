import p5 from "q5";
import type {
  Lobby,
  LobbyPlayerLive,
  PlayerPosition,
} from "@/context/game.context";
import emitter from "@/lib/emitter";
import playerController from "./player-controller";

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
  chatMessages: Record<string, { message: string; timestamp: number }>;
};

export type StateType = {
  playerId: string | null;
  followingPlayer: LobbyPlayerLive | null;
  currentLobbyMeta: LobbyMeta | null;
  currentLobbyLive: LobbyLive | null;
  ping: number;
  cameraPosition: PlayerPosition;
  targetCameraPosition: PlayerPosition;
  assets: Record<string, p5.Image>;
  chatInputFocus: boolean;
};

const createState = () =>
  ({
    playerId: null,
    followingPlayer: null,
    currentLobbyMeta: null,
    currentLobbyLive: null,
    ping: 0,
    cameraPosition: { x: 0, y: 0 },
    targetCameraPosition: { x: 0, y: 0 },
    assets: {},
    chatInputFocus: false,
  } as StateType);

const stateMachine = () => {
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
    state.playerId = playerId;

    state.currentLobbyMeta = {
      id: data.id,
      name: data.name,
      teamSize: data.teamSize,
      countryCode: data.countryCode,
    };
  };

  // this is the live update data that we receive
  // from the server as the game is running, which
  // all the real-time data like player positions
  const onLobbyLiveUpdate = ({ data }: { data: LobbyLive }) => {
    if (state.currentLobbyLive) {
      data.players.forEach((updatedPlayer) => {
        const existingPlayer = state.currentLobbyLive?.players.find(
          (player) => player.id === updatedPlayer.id
        );

        if (existingPlayer) {
          updatedPlayer.previousPosition = existingPlayer.targetPosition;
          updatedPlayer.targetPosition = updatedPlayer.position;
        } else {
          updatedPlayer.previousPosition = updatedPlayer.position;
          updatedPlayer.targetPosition = updatedPlayer.position;
        }
      });
    }

    const myPlayer =
      state.currentLobbyLive?.players.find(
        (player) => player.id === state.playerId
      ) ?? null;

    state.currentLobbyLive = data;
    state.followingPlayer = myPlayer;

    if (myPlayer) {
      state.targetCameraPosition = { ...myPlayer.position };
    }

    // emitter.emit("game:lobby-live-update-processed");
  };

  const onPingReceived = (ping: number) => {
    state.ping = ping;
  };

  const onChatInputFocusStart = () => {
    ["up", "down", "left", "right"].forEach((direction) => {
      playerController(state).move("end", direction);
    });

    state.chatInputFocus = true;
  };

  const onChatInputFocusEnd = () => {
    state.chatInputFocus = false;
  };

  const init = () => {
    emitter.on("ws:message:lobby-live-update", onLobbyLiveUpdate);
    emitter.on("game:current-lobby-meta", onGetCurrentLobby);
    emitter.on("game:ping", onPingReceived);
    emitter.on("game:chat-input-focus-start", onChatInputFocusStart);
    emitter.on("game:chat-input-focus-end", onChatInputFocusEnd);

    emitter.emit("game:get-current-lobby");
  };

  const cleanup = () => {
    emitter.off("ws:message:lobby-live-update", onLobbyLiveUpdate);
    emitter.off("game:current-lobby-meta", onGetCurrentLobby);
    emitter.off("game:ping", onPingReceived);
    emitter.off("game:chat-input-focus-start", onChatInputFocusStart);
    emitter.off("game:chat-input-focus-end", onChatInputFocusEnd);
  };

  return {
    init,
    cleanup,
    state,
  };
};

export default stateMachine;
