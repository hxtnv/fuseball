let friction = .99;

class Raycast {
  constructor(x, y) {
    this.sprite = p5.createSprite(x, y, 250, 250);
    this.sprite.setCollider('rectangle');
    this.sprite.draw = () => {};
    this.sprite.debug = true;
  }

  update(state, enemy, id, callback) {
    let shouldKick = false;

    this.sprite.velocity.x *= friction;
    this.sprite.velocity.y *= friction;

    this.sprite.overlap(state.scene.goals[enemy], () => {
      shouldKick = true;
    });

    for(let i in state.players) {
      this.sprite.overlap(state.players[i].sprite, () => {
        if(state.players[i].team !== enemy && state.players[i].id !== id) shouldKick = true;
      });
    }

    p5.drawSprite(this.sprite);

    callback(shouldKick);
  }
}

export default Raycast;