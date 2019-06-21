class Button {
  constructor(props) {
    this.props = props;

    this.isHover = false;

    p5.mouseClicked = () => {
      if(this.isHover && this.onClickCallback && this.visible) this.onClickCallback();
    }
  }

  update() {
    this.draw();

    this.isHover = false;

    if(
      p5.mouseX >= this.pos.x && p5.mouseX <= this.pos.x + this.size.x &&
      p5.mouseY >= this.pos.y && p5.mouseY <= this.pos.y + this.size.y
    ) this.isHover = true;

    this.visible = this.props.bgColor[3] > 0 && this.props.bgStrokeColor[3] > 0 && this.props.textColor[3] > 0 && this.props.textStrokeColor[3] > 0;
  }

  draw() {
    p5.textSize(this.props.fontSize);

    let btnWidth = p5.textWidth(this.props.text);

    this.pos = {
      x: this.props.x == 'center' ? (p5.windowWidth / 2) - (btnWidth / 2) - this.props.padding[0] : this.props.x,
      y: p5.windowHeight * .8
    };

    this.size = {
      x: btnWidth + (this.props.padding[0] * 2),
      y: this.props.fontSize + (this.props.padding[1] * 2)
    };

    p5.fill(this.props.bgColor[0], this.props.bgColor[1], this.props.bgColor[2], this.props.bgColor[3]);
    p5.strokeWeight(4);
    p5.stroke(this.props.bgStrokeColor[0], this.props.bgStrokeColor[1], this.props.bgStrokeColor[2], this.props.bgStrokeColor[3]);
    p5.rect(this.pos.x, this.pos.y, this.size.x, this.size.y);

    p5.stroke(this.props.textStrokeColor[0], this.props.textStrokeColor[1], this.props.textStrokeColor[2], this.props.textStrokeColor[3]);
    p5.fill(this.props.textColor[0], this.props.textColor[1], this.props.textColor[2], this.props.textColor[3]);
    
    p5.text(this.props.text, this.pos.x + this.props.padding[0], this.pos.y + this.props.fontSize + (this.props.padding[1] / 2) - 2);

  }

  onHover(callback) {
    if(!this.isHover) return;

    callback();
  }

  onClick(callback) {
    this.onClickCallback = callback;
  }
}

export default Button;