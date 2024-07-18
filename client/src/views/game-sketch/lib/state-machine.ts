import p5 from "q5";
import Player from "../classes/player";
import ControllablePlayer from "../classes/controllable-player";

// class MutableState {
//   state: any;

//   constructor(initialState: any) {
//     this.state = initialState;
//   }

//   set(newState: any) {
//     this.state = newState;
//   }

//   get() {
//     return this.state;
//   }
// }

export type StateType = {
  players: Player[];
  controllablePlayer: ControllablePlayer;
};

const stateMachine = (p: p5) => {
  const players: StateType["players"] = [];
  const controllablePlayer: StateType["controllablePlayer"] =
    new ControllablePlayer(p, {
      position: {
        x: 700,
        y: 400,
      },
    });
  // let interval: number | undefined = undefined;

  const init = () => {
    console.log("stateMachine.init");
    Array.from(Array(10)).forEach(() => {
      players.push(
        new Player(p, {
          position: {
            x: p.random(p.windowWidth),
            y: p.random(p.windowHeight),
          },
        })
      );
    });

    // interval = setInterval(() => {
    // console.log("stateMachine.interval");
    // }, 1000);
  };

  const cleanup = () => {
    // todo: this is never called
    console.log("stateMachine.cleanup");

    // clearInterval(interval);
    // here we would cancel event listeners and so
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
