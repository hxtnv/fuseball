function drawMultiColorText(text_array, x, y) {
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

export default drawMultiColorText;