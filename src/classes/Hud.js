class Hud {
  constructor() {
    this.score = [0, 0];
    this.timer = 300;

    this.timerInterval = setInterval(() => {
      if(this.timer <= 1) clearInterval(this.timerInterval);
      this.timer--;
    }, 1000);



    this.sHeight = 0;
    this.sAlpha = 0;
    this.sWinner = 0; // 0 = red, 1 = blue
  }

  teamScore(mode, winner) {
    this.sWinner = winner === 0 ? 1 : 0;

    this.sInterval = setInterval(() => {
      if(mode === 0) {
        this.sHeight += 16;
        this.sAlpha += 24;

        if(this.sHeight >= 150) {
          setTimeout(() => this.teamScore(1, winner), 2000);
          clearInterval(this.sInterval);
        }
        
      } else {
        this.sHeight -= 16;
        this.sAlpha -= 24;

        if(this.sHeight <= 0) clearInterval(this.sInterval);
      }
    }, 1000 / 60);
  }

  update() {
    p5.camera.off();

    // timer
    let minutes = Math.floor(this.timer / 60);
    let seconds = this.timer - minutes * 60;

    let timerText = `${minutes <= 9 ? 0 : ''}${minutes}:${seconds <= 9 ? 0 : ''}${seconds}`;

    p5.fill(255);
    p5.strokeWeight(4);
    p5.stroke(65);

    p5.textSize(32);
    p5.textFont('Itim');
    p5.text(timerText, p5.windowWidth / 2 - p5.textWidth(timerText) / 2, 70);

    // score
    let scorePadding = 90;

    p5.textSize(48);

    p5.fill(255, 75, 75); // red
    p5.text(this.score[0], p5.windowWidth / 2 - scorePadding - p5.textWidth(this.score[0].toString()), 74);

    p5.fill(67, 149, 249); // blue
    p5.text(this.score[1], p5.windowWidth / 2 + scorePadding, 74);


    if(this.sAlpha > 0 || this.sHeight > 0) {
      p5.noStroke();
      p5.fill(0, 0, 0, 120);
      p5.rect(0, (p5.windowHeight - this.sHeight) / 2, p5.windowWidth, this.sHeight);


      let winnerString = {
        text: this.sWinner === 0 ? 'Red' : 'Blue',
        color: this.sWinner === 0 ? [255, 75, 75, this.sAlpha] : [67, 149, 249, this.sAlpha]
      }

      var string = [
          ['Team ', [255, 255, 255, this.sAlpha]],
          [winnerString.text, winnerString.color],
          [' scores!', [255, 255, 255, this.sAlpha]]
      ];

      let scoreText = string[0][0] + string[1][0] + string[2][0];

      p5.fill(255, 20, 20, this.sAlpha);
      p5.textSize(48);
      drawtext(p5.windowWidth / 2 - p5.textWidth(scoreText) / 2, p5.windowHeight / 2 + 15, string);
    }
  }
}








// move to helpers  
function drawtext(x, y, text_array) {
  let pos_x = x;
  
  for(let i=0; i<text_array.length; i++) {
    let part = text_array[i];
    let t = part[0];
    let c = part[1];
    let w = p5.textWidth(t);

    p5.fill(c);
    p5.text(t, pos_x, y);
    pos_x += w;
  }
}

export default Hud;