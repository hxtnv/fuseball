import useGameServerContext from "@/hooks/context/use-game-server";
import useAuthContext from "@/hooks/context/use-auth";
import mapRenderer from "../lib/renderers/map";
import playersRenderer from "../lib/renderers/players";
import uiRenderer from "../lib/renderers/ui";
import renderSeparation from "../lib/helpers/render-separation";
import extrasRenderer from "../lib/renderers/extras";
import carsRenderer from "../lib/renderers/cars";
import { useCreateCanvas } from "q5-react";
import GAME from "shared/lib/const/game";
import type { Lobby } from "shared/types/game";
import { useEffect } from "react";
import keyMap from "@/lib/const/key-map";
import GAME_PLAYER from "shared/lib/const/game-player";

export interface LobbyClientSide extends Lobby {
  ping: number;
  cameraZoom: number;
  targetCameraZoom: number;
}

const emptyInitialLobby: LobbyClientSide = {
  id: "",
  status: "warmup",
  players: [],
  teamSize: GAME.TEAM_SIZE,
  teams: [],
  ball: {
    position: { x: 0, y: 0 },
  },
  reactions: {},
  ping: 0,
  extras: {
    cars: [],
    npcs: [],
  },
  cameraZoom: 1,
  targetCameraZoom: 1,
};

const SERVER_TICK_RATE = 30; // Hz
const SERVER_TICK_INTERVAL = 1000 / SERVER_TICK_RATE; // ms

import { useRef } from "react";

const useGameCanvas = () => {
  const { webSocket, pings, selectedServer } = useGameServerContext();
  const { details } = useAuthContext();

  const onKeyDown = (eventKey: string) => {
    const type = Object.keys(keyMap).find((key) =>
      keyMap[key].includes(eventKey.toLowerCase())
    );

    if (!type || !webSocket) {
      return;
    }

    webSocket.sendMessage("playerInputStart", {
      type,
    });
  };

  const onKeyUp = (eventKey: string) => {
    const type = Object.keys(keyMap).find((key) =>
      keyMap[key].includes(eventKey.toLowerCase())
    );

    if (!type || !webSocket?.sendMessage) {
      return;
    }

    webSocket.sendMessage("playerInputEnd", {
      type,
    });
  };

  // State history for interpolation
  // Track initialization to avoid fallback to emptyInitialLobby
  const stateHistory = useRef({
    previous: { state: emptyInitialLobby, timestamp: Date.now() },
    current: { state: emptyInitialLobby, timestamp: Date.now() },
    initialized: false,
  });

  // Camera zoom refs (persist across renders and canvas resets)
  const cameraZoom = useRef(1);
  const targetCameraZoom = useRef(1);

  const canvas = useCreateCanvas<LobbyClientSide>(
    emptyInitialLobby,
    (p) => {
      const now = Date.now();
      const { previous, current } = stateHistory.current;
      const delta = current.timestamp - previous.timestamp || 1; // ms
      const renderDelta = now - current.timestamp;
      // Clamp alpha between 0 and 1
      // let alpha = (renderDelta + SERVER_TICK_INTERVAL) / delta;
      // alpha = Math.max(0, Math.min(1, alpha));
      const alpha = Math.max(
        0,
        Math.min(1, (renderDelta + SERVER_TICK_INTERVAL) / delta)
      );

      // Helper for lerp
      const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
      // Shallow copy for base
      const interpState: LobbyClientSide = { ...current.state };

      // Interpolate players by id (robust to join/leave)
      interpState.players = current.state.players.map((currPlayer) => {
        const prevPlayer = previous.state.players.find(
          (p) => p.details.id === currPlayer.details.id
        );
        if (!prevPlayer) return currPlayer;
        return {
          ...currPlayer,
          position: {
            x: lerp(prevPlayer.position.x, currPlayer.position.x, alpha),
            y: lerp(prevPlayer.position.y, currPlayer.position.y, alpha),
          },
        };
      });

      // Interpolate ball
      if (current.state.ball && previous.state.ball) {
        interpState.ball = {
          ...current.state.ball,
          position: {
            x: lerp(
              previous.state.ball.position.x,
              current.state.ball.position.x,
              alpha
            ),
            y: lerp(
              previous.state.ball.position.y,
              current.state.ball.position.y,
              alpha
            ),
          },
        };
      }

      // Do NOT interpolate cars or npcs; just use current state
      interpState.extras = current.state.extras;

      const targetPlayer = interpState.players.find(
        (player) => player.details.id === details?.id
      );

      const map = mapRenderer(p);
      const players = playersRenderer(p, interpState);
      const ui = uiRenderer(p, interpState, { targetPlayer });
      const extras = extrasRenderer(p, interpState);
      const cars = carsRenderer(p, interpState);

      p.background(111, 173, 78);

      renderSeparation(() => {
        p.translate(p.width / 2, p.height / 2);

        if (targetPlayer) {
          // Update target zoom based on player state
          targetCameraZoom.current = targetPlayer.isSprinting
            ? GAME_PLAYER.SPRINT_ZOOM
            : 1;

          // Smoothly lerp camera zoom
          const zoomSpeed = 0.1;
          cameraZoom.current =
            cameraZoom.current +
            (targetCameraZoom.current - cameraZoom.current) * zoomSpeed;

          p.scale(cameraZoom.current);
          p.translate(-targetPlayer?.position.x, -targetPlayer?.position.y);
        }

        map.draw();
        players.draw();
        extras.draw();
        cars.draw();
      }, p);

      ui.draw();
    },
    {
      keyPressed: onKeyDown,
      keyReleased: onKeyUp,
    }
  );

  useEffect(() => {
    if (!webSocket) {
      return;
    }

    const unsubscribe = webSocket.subscribe<Lobby>("lobbyUpdate", (data) => {
      const now = Date.now();
      const prev = stateHistory.current.current.state;

      const patched: LobbyClientSide = {
        ...data,
        ping: prev.ping ?? 0,
        cameraZoom: prev.cameraZoom ?? 1,
        targetCameraZoom: prev.targetCameraZoom ?? 1,
      };

      if (!stateHistory.current.initialized) {
        stateHistory.current.previous = { state: patched, timestamp: now };
        stateHistory.current.current = { state: patched, timestamp: now };
        stateHistory.current.initialized = true;
      } else {
        stateHistory.current.previous = {
          state: stateHistory.current.current.state,
          timestamp: stateHistory.current.current.timestamp,
        };
        stateHistory.current.current = {
          state: patched,
          timestamp: now,
        };
      }

      canvas.state.set(patched);
    });

    return unsubscribe;
  }, [canvas, webSocket]);

  useEffect(() => {
    if (!selectedServer) {
      return;
    }

    canvas.state.set((state) => ({
      ...state,
      ping: pings[selectedServer.id] ?? 0,
    }));
  }, [canvas, pings, selectedServer]);

  return canvas;
};

export default useGameCanvas;
