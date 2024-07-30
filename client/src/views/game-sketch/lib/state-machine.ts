import p5 from "q5";
import type {
  Lobby,
  LobbyPlayerLive,
  PositionType,
  LobbyLive,
  LobbyMeta,
} from "@/context/game.context";
import emitter from "@/lib/emitter";
import playerController from "./player-controller";

export type StateType = {
  playerId: string | null;
  followingPlayer: LobbyPlayerLive | null;
  currentLobbyMeta: LobbyMeta | null;
  currentLobbyLive: LobbyLive | null;
  ping: number;
  cameraPosition: PositionType;
  cameraScale: number;
  targetCameraPosition: PositionType;
  targetCameraScale: number;
  assets: Record<string, p5.Image>;
  chatInputFocus: boolean;
  isMobile: boolean;
  isHorizontal: boolean;
  touch: PositionType;
};

const createState = () =>
  ({
    playerId: null,
    followingPlayer: null,
    currentLobbyMeta: null,
    currentLobbyLive: null,
    ping: 0,
    cameraPosition: { x: 0, y: 0 },
    cameraScale: 1,
    targetCameraScale: 1,
    targetCameraPosition: { x: 0, y: 0 },
    assets: {},
    chatInputFocus: false,
    isMobile: false,
    isHorizontal: false,
    touch: { x: 0, y: 0 },
  } as StateType);

const stateMachine = () => {
  const state = createState();

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

  const onLobbyLiveUpdate = ({ data }: { data: LobbyLive }) => {
    if (state.currentLobbyLive) {
      data.players.forEach((updatedPlayer) => {
        if (!state.currentLobbyLive) return;

        const existingPlayer = state.currentLobbyLive.players.find(
          (player) => player.id === updatedPlayer.id
        );

        if (existingPlayer) {
          updatedPlayer.previousPosition =
            existingPlayer.targetPosition ?? existingPlayer.position;
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
  };

  const onPingReceived = (ping: number) => {
    state.ping = ping;
  };

  const onChatInputFocusStart = () => {
    // ["up", "down", "left", "right"].forEach((direction) => {
    //   playerController(state).move("end", direction);
    // });
    playerController(state).stopAllMovements();

    state.chatInputFocus = true;
  };

  const onChatInputFocusEnd = () => {
    state.chatInputFocus = false;
  };

  const onIsMobile = (data: boolean) => {
    state.isMobile = data;
  };

  const onIsHorizontal = (data: boolean) => {
    state.isHorizontal = data;
  };

  const init = () => {
    emitter.on("ws:message:lobby-live-update", onLobbyLiveUpdate);
    emitter.on("game:current-lobby-meta", onGetCurrentLobby);
    emitter.on("game:chat-input-focus-start", onChatInputFocusStart);
    emitter.on("game:chat-input-focus-end", onChatInputFocusEnd);
    emitter.on("game:ping", onPingReceived);
    emitter.on("game:is-mobile", onIsMobile);
    emitter.on("game:is-horizontal", onIsHorizontal);

    emitter.emit("game:get-current-lobby");
  };

  const cleanup = () => {
    emitter.off("ws:message:lobby-live-update", onLobbyLiveUpdate);
    emitter.off("game:current-lobby-meta", onGetCurrentLobby);
    emitter.off("game:chat-input-focus-start", onChatInputFocusStart);
    emitter.off("game:chat-input-focus-end", onChatInputFocusEnd);
    emitter.off("game:ping", onPingReceived);
    emitter.off("game:is-mobile", onIsMobile);
    emitter.off("game:is-horizontal", onIsHorizontal);
  };

  return {
    init,
    cleanup,
    state,
  };
};

export default stateMachine;
