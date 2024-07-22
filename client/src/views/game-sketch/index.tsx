import React, { useRef, useEffect, Fragment } from "react";
import p5 from "q5";
import gameSketch from "./sketch";
import SignOut from "@/assets/icons/sign-out-alt-solid.svg?react";
import styles from "./game-sketch.module.scss";
import Button from "@/components/common/button";
import { useGameContext } from "@/context/game.context";
import useModal from "@/hooks/use-modal/use-modal";

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
  const { leaveLobby } = useGameContext();
  const { Modal, open } = useModal();

  return (
    <Fragment>
      <div className={styles.game}>
        <Button
          variant="secondary"
          onClick={() => open()}
          style={{ width: "auto" }}
        >
          <SignOut />
        </Button>

        <Modal
          title="Quit game"
          confirmText="Leave game"
          cancelText="Stay"
          onConfirm={leaveLobby}
          showFooter
        >
          <p style={{ textAlign: "center", margin: "20px 0" }}>
            Are you sure you want to leave the game?
          </p>
        </Modal>
      </div>

      <P5Sketch />
    </Fragment>
  );
};

export default Game;
