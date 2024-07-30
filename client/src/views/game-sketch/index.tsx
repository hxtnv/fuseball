import React, { useRef, useEffect, Fragment } from "react";
import p5 from "q5";
import gameSketch from "./sketch";
import GameOverlay from "@/components/game-overlay";
import useCheckMobileScreen from "@/hooks/use-check-mobile";
import useCheckHorizontal from "@/hooks/use-check-horizontal";
import emitter from "@/lib/emitter";

const P5Sketch: React.FC = () => {
  const sketchRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5 | null>(null);

  const isMobile = useCheckMobileScreen();
  const isHorizontal = useCheckHorizontal();

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

  useEffect(() => {
    emitter.emit("game:is-mobile", isMobile);
    emitter.emit("game:is-horizontal", isHorizontal);
  }, [isMobile, isHorizontal]);

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
