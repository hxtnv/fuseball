import React, { useRef, useEffect } from "react";
import p5 from "p5";

import gameSketch, { cleanup } from "./sketch";

const P5Sketch: React.FC = () => {
  const sketchRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5 | null>(null);

  useEffect(() => {
    console.info("Rendering sketch");

    if (sketchRef.current) {
      if (!p5InstanceRef.current) {
        p5InstanceRef.current = new p5(gameSketch, sketchRef.current);
      }
    }

    return () => {
      if (p5InstanceRef.current) {
        console.info("Cleaning up sketch");

        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      }

      cleanup();
    };
  }, []);

  return <div ref={sketchRef}></div>;
};

export default P5Sketch;
