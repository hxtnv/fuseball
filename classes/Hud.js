class Hud {
  constructor() {
    this.font = loadFont('./fonts/Itim.ttf');

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


    if(this.sAlpha > 0 || this.sHeight > 0) {
      noStroke();
      fill(0, 0, 0, 120);
      rect(0, (windowHeight - this.sHeight) / 2, windowWidth, this.sHeight);


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

      fill(255, 20, 20, this.sAlpha);
      textSize(48);
      drawtext(windowWidth / 2 - textWidth(scoreText) / 2, windowHeight / 2 + 15, string);
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
    let w = textWidth(t);

    fill(c);
    text(t, pos_x, y);
    pos_x += w;
  }
}