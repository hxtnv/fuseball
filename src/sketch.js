import Player from './classes/Player';
import Ball from './classes/Ball';
import Scene from './classes/Scene';
import Hud from './classes/Hud';

import keys from './const/keys';

let state = {
  players: [],
  ball: undefined,
  scene: undefined,
  hud: undefined,

  goals: [false, false],
  prevGoals: [false, false],

  isReset: false
}

const sketch = (p) => {
  window.p5 = p;

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);

    state.player = new Player({
      name: 'test1',
      color: p.color(86, 139, 231),
      size: 40,
      speed: 5,
      friction: .7,
      pos: {
        x: 100,
        y: 0
      }
    });


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
      size: 1200
    });

    state.hud = new Hud();
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  }

  p.draw = () => {
    p.background(state.scene.props.background);

    state.scene.update();
    state.player.update();
    state.ball.update();
    state.hud.update();


    p.camera.position = state.player.sprite.position; // follow player

    state.player.sprite.bounce(state.ball.sprite);
    state.player.sprite.collide(state.scene.col);

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
    

    state.player.sprite.overlap(state.ball.hitCollider, () => {
      let angle = Math.atan2(state.ball.sprite.position.y - state.player.sprite.position.y, state.ball.sprite.position.x - state.player.sprite.position.x) * 180 / Math.PI;

      for(let i in keys.KICK) {
        if(state.player.keys[keys.KICK[i]]) return state.ball.sprite.addSpeed(10, angle);
      }
    });

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

    state.player.sprite.position.x = 100;
    state.player.sprite.position.y = 0;

    state.player.sprite.velocity.x = 0;
    state.player.sprite.velocity.y = 0;

    state.isReset = false;
  }, 2000);
}

export default sketch;