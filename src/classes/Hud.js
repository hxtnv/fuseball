import Button from './hud/Button';

import drawMultiColorText from '../helpers/drawMultiColorText';

class Hud {
  constructor(state) {
    this.sbOverlayAlpha = 0;
    this.sbAlpha = 0;

    this.sHeight = 0;
    this.sAlpha = 0;
    this.sWinner = 0; // 0 = red, 1 = blue

    this.blinkAlpha = 0;

    this.playAgainBtn = new Button({
      text: 'Play again',
      x: 'center', // (p5.windowWidth / 2) - (btnWidth / 2) - btnPadding[0]
      y: p5.windowHeight * .8,
      padding: [30, 10],
      fontSize: 28,
      borderRadius: 5,
      bgColor: [75, 207, 69, 0],
      bgStrokeColor: [69, 175, 65, 0],
      textColor: [255, 255, 255, 0],
      textStrokeColor: [51, 51, 51, 0]
    });

    this.playAgainBtn.onClick(() => {
      if(this.sbAlpha <= 0 || state.isLive) return;
      state.restart();
    });
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
    p5.strokeWeight(4);
    p5.stroke(65);

    p5.fill(255, 75, 75); // red
    p5.text(state.score[0], p5.windowWidth / 2 - scorePadding - p5.textWidth(state.score[0].toString()), 74);

    p5.fill(67, 149, 249); // blue
    p5.text(state.score[1], p5.windowWidth / 2 + scorePadding, 74);


    if(this.sAlpha > 0 || this.sHeight > 0) {
      p5.noStroke();
      p5.fill(0, 0, 0, 160);
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

    // timer blink thing
    let _timeSinceRoundStart = state.timerRoundStart - state.timer;

    if(state.timer <= 10 || (_timeSinceRoundStart >= 5 && _timeSinceRoundStart <= 7 && !state.isStarted)) {
      this.shouldBlink = true;
    } else {
      this.shouldBlink = false;
    }

    p5.fill(255, 255, 255, this.shouldBlink ? this.blinkAlpha : 255);

    if(this.shouldBlink) {
      if(this.blinkAlpha > 0) {
        p5.strokeWeight(4);
        p5.stroke(65);
      } else {
        p5.noStroke();
      }
    } else {
      p5.strokeWeight(4);
      p5.stroke(65);
    }

    p5.textSize(32);
    p5.textFont('Itim');
    p5.text(timerText, p5.windowWidth / 2 - p5.textWidth(timerText) / 2, 70);
  }

  initScoreBoard(state) {
    clearInterval(this.sbInterval);
    this.sbInterval = null;

    this.sbOverlayAlpha = 0;

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
    clearInterval(this.sbaInterval);
    this.sbaInterval = null;

    this.sbAlpha = 0;

    this.sbaInterval = setInterval(() => {
      this.sbAlpha += 8;

      if(this.sbAlpha >= 255) {
        clearInterval(this.sbaInterval);
        this.sbaInterval = null;
      }
    }, 1000 / 60);
  }

  initBlinker(state) {
    this.blinkTimer = setInterval(() => {
      this.blinkAlpha = this.blinkAlpha === 255 ? 0 : 255;

      if(state.isOver) {
        clearInterval(this.blinkTimer);
        this.blinkTimer = null;

        this.blinkAlpha = 255;
      }
    }, 500);
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
      p5.text(text, p5.windowWidth / 2 - p5.textWidth(text) / 2, p5.windowHeight * .2); // should prob make it responsive (todo)
    }


    // score
    let scorePadding = 40;

    p5.textSize(128);
    p5.stroke(25, 25, 25, this.sbAlpha);
    p5.strokeWeight(8);

    let scoreText = `${state.score[0] > state.score[1] ? state.score[0] : state.score[1]} - ${state.score[0] > state.score[1] ? state.score[1] : state.score[0]}`;
    p5.text(scoreText, p5.windowWidth / 2 - p5.textWidth(scoreText) / 2, p5.windowHeight * .35);


    // buttons
    // text, x, y, padding, fontSize, borderRadius, bgColor, bgStrokeColor, textColor, textStrokeColor
    this.playAgainBtn.update();

    this.playAgainBtn.props.bgColor[3] = this.sbAlpha;
    this.playAgainBtn.props.bgStrokeColor[3] = this.sbAlpha;
    this.playAgainBtn.props.textColor[3] = this.sbAlpha;
    this.playAgainBtn.props.textStrokeColor[3] = this.sbAlpha;

    this.playAgainBtn.onHover(() => {
      this.playAgainBtn.props.bgColor[3] = 200;
      this.playAgainBtn.props.textColor[3] = 200;
    });
  }

  drawDebug(state) {
    let fps = parseInt(p5.frameRate());

    p5.push();
    p5.noStroke();
    p5.textFont('Courier New');
    p5.textSize(16);
    p5.fill(255);


    p5.text(`FPS: ${fps}`, 20, 40);
    if(state.players[0]) p5.text(`Pos: ${state.players[0].sprite.position.x.toFixed(2)} / ${state.players[0].sprite.position.y.toFixed(2)}`, 20, 55);
    
    p5.pop();
  }

  update(state) {
    p5.camera.off();

    this.drawTimer(state);
    this.drawScore(state);
    this.drawDebug(state);
    if(!state.isLive && !this.shouldDrawScoreboard) {
      this.shouldDrawScoreboard = true;
      this.initScoreBoard(state);
    }

    if(!state.isLive) this.drawScoreBoard(state);
    if(!this.blinkTimer) this.initBlinker(state);
  }
}

export default Hud;