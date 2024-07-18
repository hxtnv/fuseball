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

const stateMachine = (p: p5) => {
  const players: Player[] = [];
  const controllablePlayer = new ControllablePlayer(p, {
    position: {
      x: p.windowWidth / 2,
      y: p.windowHeight / 2,
    },
    size: 50,
  });

  const init = () => {
    Array.from(Array(10)).forEach(() => {
      players.push(
        new Player(p, {
          position: {
            x: p.random(p.windowWidth),
            y: p.random(p.windowHeight),
          },
          size: 50,
        })
      );
    });
  };

  const cleanup = () => {
    // here we would cancel event listeners and so
  };

  return {
    _state: {
      init,
      cleanup,
    },
    players,
    controllablePlayer,
  };
};

export default stateMachine;
