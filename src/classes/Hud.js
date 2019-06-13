import drawMultiColorText from '../helpers/drawMultiColorText';

class Hud {
  constructor() {
    this.sbOverlayAlpha = 0;
    this.sbAlpha = 0;

    this.sHeight = 0;
    this.sAlpha = 0;
    this.sWinner = 0; // 0 = red, 1 = blue
  }

  teamScore(mode, winner, time) {
    this.sWinner = winner === 0 ? 1 : 0;

    this.sInterval = setInterval(() => {
      if(mode === 0) {
        this.sHeight += 16;
        this.sAlpha += 24;

        if(this.sHeight >= 150 && time > 0) {
          setTimeout(() => this.teamScore(1, winner, 2000), time);
          clearInterval(this.sInterval);
        }
        
      } else {
        this.sHeight -= 16;
        this.sAlpha -= 24;

        if(this.sHeight <= 0) clearInterval(this.sInterval);
      }
    }, 1000 / 60);
  }

  drawScore(state) {
    let scorePadding = 90;

    p5.textSize(48);

    p5.fill(255, 75, 75); // red
    p5.text(state.score[0], p5.windowWidth / 2 - scorePadding - p5.textWidth(state.score[0].toString()), 74);

    p5.fill(67, 149, 249); // blue
    p5.text(state.score[1], p5.windowWidth / 2 + scorePadding, 74);


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
      drawMultiColorText(string, p5.windowWidth / 2 - p5.textWidth(scoreText) / 2, p5.windowHeight / 2 + 15);
    }
  }

  drawTimer(state) {
    let minutes = Math.floor(state.timer / 60);
    let seconds = state.timer - minutes * 60;

    let timerText = `${minutes <= 9 ? 0 : ''}${minutes}:${seconds <= 9 ? 0 : ''}${seconds}`;

    p5.fill(255);
    p5.strokeWeight(4);
    p5.stroke(65);

    p5.textSize(32);
    p5.textFont('Itim');
    p5.text(timerText, p5.windowWidth / 2 - p5.textWidth(timerText) / 2, 70);
  }

  initScoreBoard(state) {
    this.sbInterval = setInterval(() => {
      this.sbOverlayAlpha += 8;

      if(this.sbOverlayAlpha >= 190) {
        this.initSbAlpha(state);

        clearInterval(this.sbInterval);
        this.sbInterval = null;
      }
    }, 1000 / 60);
  }

  initSbAlpha(state) {
    this.sbaInterval = setInterval(() => {
      this.sbAlpha += 8;

      if(this.sbAlpha >= 255) {
        clearInterval(this.sbaInterval);
        this.sbaInterval = null;
      }
    }, 1000 / 60);
  }

  drawScoreBoard(state) {
    let w = p5.windowWidth / 2;
    let h = p5.windowHeight / 2;

    p5.noStroke();
    p5.fill(0, 0, 0, this.sbOverlayAlpha); // sb = scoreboard
    p5.rect(0, 0, p5.windowWidth, p5.windowHeight); // overlay

    // header text
    if(state.score[0] !== state.score[1]) {
      let winnerString = {
        text: state.score[0] >= state.score[1] ? 'Red' : 'Blue',
        color: state.score[0] >= state.score[1] ? [255, 75, 75, this.sbAlpha] : [67, 149, 249, this.sbAlpha]
      }

      let text = [
        ['Team ', [255, 255, 255, this.sbAlpha]],
        [winnerString.text, winnerString.color],
        [' has won the game!', [255, 255, 255, this.sbAlpha]],
      ];

      drawMultiColorText(text, p5.windowWidth / 2 - p5.textWidth(text[0][0] + text[1][0] + text[2][0]) / 2, p5.windowHeight * .2);
    } else {
      let text = `It's a draw!`;

      p5.fill(255, 255, 255, this.sbAlpha);
      p5.text(text, p5.windowWidth / 2 - p5.textWidth(text) / 2, p5.windowHeight * .2);
    }


    // score
    let scorePadding = 40;

    p5.textSize(128);
    p5.stroke(25, 25, 25, this.sbAlpha);
    p5.strokeWeight(8);

    let scoreText = `${state.score[0]} - ${state.score[1]}`;
    p5.text(scoreText, p5.windowWidth / 2 - p5.textWidth(scoreText) / 2, p5.windowHeight * .35);
  }

  update(state) {
    p5.camera.off();

    this.drawTimer(state);
    this.drawScore(state);
    if(!state.isLive && !this.shouldDrawScoreboard) {
      this.shouldDrawScoreboard = true;
      this.initScoreBoard(state);
    }

    if(!state.isLive) this.drawScoreBoard(state);
  }
}

export default Hud;