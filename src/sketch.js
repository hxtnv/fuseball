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
    state.scene = new Scene({
      background: p.color(92, 134, 70), /* 81, 140, 50 */
      size: 1400
    });

    state.players.push(
      new Player({name: 'test1', controllable: true, speed: 5, team: 1}, state),
      new Bot({speed: 2.5, team: 1}, state),
      // new Bot({speed: 2.5, team: 0}, state),
      // new Bot({speed: 2.5, team: 0}, state)
    );

    state.ball = new Ball({
      size: 30,
      hitbox: 30,
      friction: .99,
      pos: {
        x: 0,
        y: 0
      }
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
    for(let i in state.players) state.players[i].update(state);
    for(let i in state.players) state.players[i].drawNameTag(); // should probably figure out a better way to do this
    state.hud.update(state);

    p5.camera.on();

    p.camera.position = state.players[0].sprite.position; // follow player

    for(let i=0; i<state.players.length; i++) {
      let player = state.players[i];

      // collisions
      player.sprite.collide(state.scene.col);
      player.sprite.bounce(state.ball.sprite, () => {
        if(!state.isStarted) state.isStarted = true;
      });


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
          player.isInRange(state, angle);
          // p5.line(state.ball.sprite.position.x, state.ball.sprite.position.y, x, y);
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


      // player collision
      for(let j=0; j<state.players.length; j++) {
        if(state.players[j].id !== player.id) player.sprite.bounce(state.players[j].sprite);
      }
    }

    state.ball.sprite.bounce(state.scene.col);

    // detect goals
    state.goals[0] = false;
    state.goals[1] = false;

    state.ball.goalCollider.overlap(state.scene.goals[0], () => state.goals[0] = true);
    goal(0, state);

    state.ball.goalCollider.overlap(state.scene.goals[1], () => state.goals[1] = true);
    goal(1, state);

    state.prevGoals[0] = state.goals[0];
    state.prevGoals[1] = state.goals[1];

    // ball fail-safe
    if(state.ball.sprite.position.x <= -(state.scene.size.x / 2) - state.scene.goalSize.x) state.ball.reset();
    if(state.ball.sprite.position.x >= (state.scene.size.x / 2) + state.scene.goalSize.x) state.ball.reset();
    if(state.ball.sprite.position.y <= -(state.scene.size.y / 2)) state.ball.reset();
    if(state.ball.sprite.position.y >= state.scene.size.y / 2) state.ball.reset();

    // auto start after 8 seconds
    if(state.timerRoundStart - state.timer >= 8) {
      if(!state.isStarted) state.isStarted = true;
    }
  };
};


export default sketch;