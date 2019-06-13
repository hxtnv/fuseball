import Player from './classes/Player';
import Ball from './classes/Ball';
import Scene from './classes/Scene';
import Hud from './classes/Hud';
import Bot from './classes/Bot';

import keys from './const/keys';

let state = {
  players: [],
  teams: [[], []],

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
        x: 100,
        y: 0
      }
    });

    state.players.push(new Bot({
      name: 'test bot 1',
      color: p.color(86, 139, 231),
      size: 40,
      speed: 2.5,
      friction: .7,
      pos: {
        x: -100,
        y: 0
      }
    }));

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
      // collisions
      state.players[i].sprite.bounce(state.ball.sprite);
      state.players[i].sprite.collide(state.scene.col);

      let nextPlayer = state.players[i + 1];
      if(nextPlayer) state.players[i].sprite.bounce(nextPlayer.sprite);


      // simple ai
      if(state.players[i].isBot) {
        state.players[i].follow(state.ball.sprite.position);
      }


      // kick action
      state.players[i].sprite.overlap(state.ball.hitCollider, () => {
        let angle = Math.atan2(state.ball.sprite.position.y - state.players[i].sprite.position.y, state.ball.sprite.position.x - state.players[i].sprite.position.x) * 180 / Math.PI;

        if(!state.players[i].isBot) {
          for(let j in keys.KICK) {
            if(state.players[i].keys[keys.KICK[j]]) return state.ball.sprite.addSpeed(10, angle);
          }
        } else {
          return state.ball.sprite.addSpeed(10, angle);
        }
      });
    }

    state.ball.sprite.bounce(state.scene.col);

    // detect goals
    state.goals[0] = false;
    state.goals[1] = false;

    state.ball.sprite.overlap(state.scene.goals[0], () => state.goals[0] = true);
    goal(0);

    state.ball.sprite.overlap(state.scene.goals[1], () => state.goals[1] = true);
    goal(1);

    state.prevGoals[0] = state.goals[0];
    state.prevGoals[1] = state.goals[1];

    // ball fail-safe
    if(state.ball.sprite.position.x <= -(state.scene.size.x / 2) - state.scene.goalSize.x) state.ball.reset();
    if(state.ball.sprite.position.x >= (state.scene.size.x / 2) + state.scene.goalSize.x) state.ball.reset();
    if(state.ball.sprite.position.y <= -(state.scene.size.y / 2)) state.ball.reset();
    if(state.ball.sprite.position.y >= state.scene.size.y / 2) state.ball.reset();
  };
};

const goal = (side) => {
  if(!state.goals[side]) return;
  if(state.goals[side] && state.prevGoals[side]) return;
  if(state.isReset) return;

  state.hud.score[side == 0 ? 1 : 0]++;

  state.isReset = true;

  state.hud.teamScore(0, side);


  clearTimeout(state.goalTimeout);
  state.goalTimeout = null;

  state.goalTimeout = setTimeout(() => {
    state.ball.reset();

    for(let i in state.players) {
      state.players[i].sprite.position.x = i == 0 ? 100 : -100; // IMPORTANT: save position somewhere
      state.players[i].sprite.position.y = 0; // this too

      state.players[i].sprite.velocity.x = 0;
      state.players[i].sprite.velocity.y = 0;
    }
    


    state.isReset = false;
  }, 2000);
}

export default sketch;