import React, { useRef, useEffect } from "react";
import p5 from "q5";

import gameSketch from "./sketch";

const P5Sketch: React.FC = () => {
  const sketchRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5 | null>(null);

  useEffect(() => {
    if (
      sketchRef.current &&
      sketchRef.current.children.length === 0 &&
      !p5InstanceRef.current
    ) {
      p5InstanceRef.current = new p5(gameSketch, sketchRef.current);
    }

    return () => {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      }
    };
  }, []);

  return <div id="canvas" ref={sketchRef}></div>;
};

export default P5Sketch;
