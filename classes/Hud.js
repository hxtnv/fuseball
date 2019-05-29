class Hud {
  constructor() {
    this.font = loadFont('./fonts/Itim.ttf');

    this.score = [0, 0];
    this.timer = 300;

    this.timerInterval = setInterval(() => {
      if(this.timer <= 1) clearInterval(this.timerInterval);
      this.timer--;
    }, 1000);
  }

  update() {
    camera.off();

    // timer
    let minutes = Math.floor(this.timer / 60);
    let seconds = this.timer - minutes * 60;

    let timerText = `${minutes <= 9 ? 0 : ''}${minutes}:${seconds <= 9 ? 0 : ''}${seconds}`;

    fill(255);
    strokeWeight(4);
    stroke(51);


    textSize(32);
    textFont(this.font);
    text(timerText, windowWidth / 2 - textWidth(timerText) / 2, 70);

    // score
    let scorePadding = 90;

    textSize(48);

    fill(255, 75, 75); // red
    text(this.score[0], windowWidth / 2 - scorePadding - textWidth(this.score[0].toString()), 74);

    fill(67, 149, 249); // blue
    text(this.score[1], windowWidth / 2 + scorePadding, 74);
  }
}