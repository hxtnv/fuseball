import Player from './classes/Player';
import Ball from './classes/Ball';
import Scene from './classes/Scene';
import Hud from './classes/Hud';
import Bot from './classes/Bot';

import goal from './helpers/goal';

import keys from './const/keys';

let state = {
  players: [],
  playerSpawns: [0, 0],

  teamTurn: 1, // 0 is red, 1 is blue
  isStarted: false,
  score: [0, 0],
  timer: 180,
  timerRoundStart: 180,
  isLive: true,
  isOver: false,

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

    // setup timer
    state.timerInterval = setInterval(() => {
      if(state.timer <= 1) {
        state.isLive = false;
        state.isOver = true;

        clearInterval(state.timerInterval);
      }
      state.timer--;
    }, 1000);

    // init game objects
    state.scene = new Scene(1400);
    state.ball = new Ball({size: 30, hitbox: 30, friction: .99});
    state.hud = new Hud();

    state.players.push(
      new Player({name: 'test1', controllable: true, speed: 5, team: 1}, state),
      new Bot({speed: 2.5, team: 1}, state),
      // new Bot({speed: 2.5, team: 0}, state),
      // new Bot({speed: 2.5, team: 0}, state)
    );
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  }

  p.draw = () => {
    p.background(92, 134, 70);

    state.scene.update();
    state.ball.update();
    for(let i in state.players) state.players[i].update(state);
    for(let i in state.players) state.players[i].drawNameTag(); // should probably figure out a better way to do this
    state.hud.update(state);

    p5.camera.on();

    state.ball.sprite.bounce(state.scene.col);

    // detect goals
    for(let i=0; i<2; i++) {
      state.goals[i] = false;
      state.ball.goalCollider.overlap(state.scene.goals[i], () => state.goals[i] = true);

      goal(i, state);

      state.prevGoals[i] = state.goals[i];
    }

    // ball fail-safe
    if(state.ball.sprite.position.x <= -(state.scene.size.x / 2) - state.scene.goalSize.x) state.ball.reset();
    if(state.ball.sprite.position.x >= (state.scene.size.x / 2) + state.scene.goalSize.x) state.ball.reset();
    if(state.ball.sprite.position.y <= -(state.scene.size.y / 2)) state.ball.reset();
    if(state.ball.sprite.position.y >= state.scene.size.y / 2) state.ball.reset();

    // auto start after 8 seconds
    if(state.timerRoundStart - state.timer >= 8 && !state.isStarted) state.isStarted = true;
  };
};


export default sketch;