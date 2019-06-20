let friction = .99;

class Raycast {
  constructor(x, y, size, id) {
    this.id = id;

    this.sprite = p5.createSprite(x, y, size, size);
    this.sprite.setCollider('circle');
    this.sprite.draw = () => {};
    // this.sprite.debug = true;
  }

  update(state, callback) {
    this.sprite.velocity.x *= friction;
    this.sprite.velocity.y *= friction;

    for(let i=0; i<2; i++) {
      this.sprite.overlap(state.scene.goals[i], (ray, goal) => callback(goal, this.sprite.position, `goal${i}`));
    }

    this.sprite.overlap(state.ball.sprite, (ray, ball) => callback(ball, this.sprite.position, 'ball'));

    for(let i in state.players) {
      this.sprite.overlap(state.players[i].sprite, (ray, player) => {
        if(state.players[i].id !== this.id) callback(player, this.sprite.position, 'player');
      });
    }

    p5.drawSprite(this.sprite);
  }
}

export default Raycast;