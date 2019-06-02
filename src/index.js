import p5 from 'p5';
import './p5.play.js';

import Player from './classes/Player';
import Ball from './classes/Ball';
import Scene from './classes/Scene';
import Hud from './classes/Hud';

import keys from './const/keys';

let player, ball, scene, hud;
let goals = [false, false], prevGoals = [false, false], goalTimeout;
let isReset = false;

const sketch = (p) => {
  window.p5 = p;

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);

    player = new Player({
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


    ball = new Ball({
      size: 30,
      hitbox: 30,
      friction: .99,
      pos: {
        x: 0,
        y: 0
      }
    });

    scene = new Scene({
      background: p.color(92, 134, 70), /* 81, 140, 50 */
      size: 1200
    });

  hud = new Hud();
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  }

  p.draw = () => {
    p.background(scene.props.background);

    scene.update();
    player.update();
    ball.update();
    hud.update();


    p.camera.position = player.sprite.position; // follow player

    player.sprite.bounce(ball.sprite);
    player.sprite.collide(scene.col);

    ball.sprite.bounce(scene.col);

    // detect goals
    goals[0] = false;
    goals[1] = false;

    ball.sprite.overlap(scene.goals[0], () => {
      goals[0] = true;
    });

    goal(0);

    ball.sprite.overlap(scene.goals[1], () => {
      goals[1] = true;
    });

    goal(1);

    prevGoals[0] = goals[0];
    prevGoals[1] = goals[1];
    

    player.sprite.overlap(ball.hitCollider, () => {
      let angle = Math.atan2(ball.sprite.position.y - player.sprite.position.y, ball.sprite.position.x - player.sprite.position.x) * 180 / Math.PI;

      for(let i in keys.KICK) {
        if(player.keys[keys.KICK[i]]) return ball.sprite.addSpeed(10, angle);
      }
    });
  };
};

const goal = (side) => {
  if(!goals[side]) return;
  if(goals[side] && prevGoals[side]) return;
  if(isReset) return;

  hud.score[side == 0 ? 1 : 0]++;

  isReset = true;

  hud.teamScore(0, side);


  clearTimeout(goalTimeout);
  goalTimeout = null;

  goalTimeout = setTimeout(() => {
    ball.sprite.position.x = 0;
    ball.sprite.position.y = 0;

    ball.sprite.velocity.x = 0;
    ball.sprite.velocity.y = 0;


    player.sprite.position.x = 100;
    player.sprite.position.y = 0;

    player.sprite.velocity.x = 0;
    player.sprite.velocity.y = 0;

    isReset = false;
  }, 2000);
}

new p5(sketch);