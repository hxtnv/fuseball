let player, ball, scene;
// let button;

function setup() {
  createCanvas(windowWidth, windowHeight);

  player = new Player({
    name: 'test1',
    color: color(86, 139, 231),
    size: 40,
    speed: 5,
    friction: .7,
    pos: {
      x: -100,
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
    background: color(92, 134, 70), /* 81, 140, 50 */
    size: 1200
  });

  // button = createButton('submit');
  // button.position(200, 65);
  // button.mousePressed(() => {
    // console.log('clicked');
  // });
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}



function draw() {
  // 84, 144, 52
  background(scene.props.background);

  scene.update();
  player.update();
  ball.update();

  camera.position = player.sprite.position; // follow player

  player.sprite.bounce(ball.sprite);
  player.sprite.collide(scene.col);

  ball.sprite.bounce(scene.col);

  // ball.sprite.overlap(scene.goals[0], () => {
  //   textSize(40);
  //   text('RED SCORE', 50, 400);
  // })

  /*player.sprite.collide(ball.sprite, () => {
    let angle = Math.atan2(ball.sprite.position.y - player.sprite.position.y, ball.sprite.position.x - player.sprite.position.x) * 180 / Math.PI;
    
    ball.sprite.addSpeed(2, angle);
  });*/

  player.sprite.overlap(ball.hitCollider, () => {
    let angle = Math.atan2(ball.sprite.position.y - player.sprite.position.y, ball.sprite.position.x - player.sprite.position.x) * 180 / Math.PI;

    for(let i in KEYS.KICK) {
      if(player.keys[KEYS.KICK[i]]) return ball.sprite.addSpeed(10, angle);
    }
  });


  // text('testtt', 50, 50);
}
