import Player from './classes/Player';
import Ball from './classes/Ball';
import Scene from './classes/Scene';
import Hud from './classes/Hud';
import Bot from './classes/Bot';

import goal from './helpers/goal';

import keys from './const/keys';

let state = {
  players: [],

  teamTurn: 1, // 0 is red, 1 is blue
  isStarted: false,

  ball: undefined,
  scene: undefined,
  hud: undefined,

  goals: [false, false],
  prevGoals: [false, false],

  isReset: false,
}

const sketch = (p) => {
  window.p5 = p;

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);

    state.players[0] = new Player({
      name: 'test1',
      controllable: true,
      color: p.color(86, 139, 231),
      size: 40,
      speed: 5,
      friction: .7,
      pos: {
        x: 300,
        y: 0
      },
      team: 1
    });

    state.players.push(new Bot({
      // name: '[Bot] Gustav',
      color: p.color(86, 139, 231),
      size: 40,
      speed: 2.5,
      friction: .7,
      pos: {
        x: -300,
        y: 0
      },
      team: 0
    }, state.players));

    state.ball = new Ball({
      size: 30,
      hitbox: 30,
      friction: .99,
      pos: {
        x: 0,
        y: 0
      }
    });

    state.scene = new Scene({
      background: p.color(92, 134, 70), /* 81, 140, 50 */
      size: 1300
    });

    state.hud = new Hud();
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  }

  p.draw = () => {
    p.background(state.scene.props.background);

    state.scene.update();
    state.ball.update();
    for(let i in state.players) state.players[i].update();
    state.hud.update();


    p.camera.position = state.players[0].sprite.position; // follow player

    for(let i=0; i<state.players.length; i++) {
      let player = state.players[i];

      // collisions
      player.sprite.collide(state.scene.col);
      player.sprite.bounce(state.ball.sprite, () => {
        if(!state.isStarted) state.isStarted = true;
      });


      // simple ai
      if(player.isBot) {
        if(state.isStarted || !state.isStarted && state.teamTurn === player.props.team) {
          player.follow(state.ball.sprite.position);
        }
      }


      // kick action
      player.sprite.overlap(state.ball.hitCollider, () => {
        let angle = Math.atan2(state.ball.sprite.position.y - player.sprite.position.y, state.ball.sprite.position.x - player.sprite.position.x) * 180 / Math.PI;

        if(!player.isBot) {
          for(let j in keys.KICK) {
            if(player.keys[keys.KICK[j]]) {
              if(!state.isStarted) state.isStarted = true; // mark game as started aswell
              return state.ball.sprite.addSpeed(10, angle);
            }
          }
        } else {
          // bot never actually touches the ball so the .collide() and .bounce() events dont work
          if(!state.isStarted) state.isStarted = true;
          return state.ball.sprite.addSpeed(10, angle);
        }
      });


      // middle border collision
      if(player.props.team !== state.teamTurn && !state.isStarted) {
        player.sprite.collide(state.scene.middle);
      }


      // sides collision
      if (!state.isStarted) {
        player.sprite.collide(state.scene.sides[player.props.team === 0 ? 1 : 0]);
      }
    }

    state.ball.sprite.bounce(state.scene.col);

    // detect goals
    state.goals[0] = false;
    state.goals[1] = false;

    state.ball.sprite.overlap(state.scene.goals[0], () => state.goals[0] = true);
    goal(0, state);

    state.ball.sprite.overlap(state.scene.goals[1], () => state.goals[1] = true);
    goal(1, state);

    state.prevGoals[0] = state.goals[0];
    state.prevGoals[1] = state.goals[1];

    // ball fail-safe
    if(state.ball.sprite.position.x <= -(state.scene.size.x / 2) - state.scene.goalSize.x) state.ball.reset();
    if(state.ball.sprite.position.x >= (state.scene.size.x / 2) + state.scene.goalSize.x) state.ball.reset();
    if(state.ball.sprite.position.y <= -(state.scene.size.y / 2)) state.ball.reset();
    if(state.ball.sprite.position.y >= state.scene.size.y / 2) state.ball.reset();
  };
};


export default sketch;