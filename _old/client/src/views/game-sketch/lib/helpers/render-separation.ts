import p5 from "q5";

const renderSeparation = (callStack: () => void, p: p5) => {
  p.push();
  callStack();
  p.pop();
};

export default renderSeparation;
