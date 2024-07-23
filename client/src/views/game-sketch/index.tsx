import React, { useRef, useEffect, Fragment } from "react";
import p5 from "q5";
import gameSketch from "./sketch";
import GameOverlay from "@/components/game-overlay";

const P5Sketch: React.FC = () => {
  const sketchRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5 | null>(null);

  useEffect(() => {
    if (sketchRef.current && !p5InstanceRef.current) {
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

const Game: React.FC = () => {
  return (
    <Fragment>
      <GameOverlay />
      <P5Sketch />
    </Fragment>
  );
};

export default Game;
