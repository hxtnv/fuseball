import p5 from "q5";
import Player from "../classes/player";
import ControllablePlayer from "../classes/controllable-player";

export type StateType = {
  players: Player[];
  controllablePlayer: ControllablePlayer;
};

const stateMachine = (p: p5) => {
  // const ws: WebSocket = new WebSocket("ws://localhost:8080");
  const players: StateType["players"] = [];
  const controllablePlayer: StateType["controllablePlayer"] =
    new ControllablePlayer(p, {
      position: {
        x: 1440 / 2,
        y: 792 / 2,
      },
    });

  const init = () => {
    // console.log("stateMachine.init");

    // ws.onopen = () => {
    //   console.info("WebSocket connection established");
    // };

    // ws.onmessage = (event) => {
    //   const message = JSON.parse(event.data);

    //   console.info("WebSocket message received: ", event.data);
    //   console.info(message);
    // };

    // ws.onclose = () => {
    //   console.info("WebSocket connection closed");
    // };

    // ws.onerror = (error) => {
    //   console.error("WebSocket error: ", error);
    // };

    Array.from(Array(0)).forEach(() => {
      players.push(
        new Player(p, {
          position: {
            x: p.random(p.windowWidth),
            y: p.random(p.windowHeight),
          },
        })
      );
    });
  };

  const cleanup = () => {
    // console.log("stateMachine.cleanup");
    // ws.close();
  };

  return {
    init,
    cleanup,
    state: {
      players,
      controllablePlayer,
    },
  };
};

export default stateMachine;
