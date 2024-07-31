import React, { useEffect, Fragment } from "react";
import Button from "@/components/common/button";
import SignOut from "@/assets/icons/sign-out-alt-solid.svg?react";
import styles from "./game-overlay.module.scss";
import { useGameContext } from "@/context/game.context";
import useModal from "@/hooks/use-modal/use-modal";

type Props = {
  inputFocus: boolean;
};

const LeaveButton: React.FC<Props> = ({ inputFocus }) => {
  const { leaveLobby } = useGameContext();
  const { Modal, open, close, isOpen } = useModal({ noEscapeClose: true });

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape" && !inputFocus) {
      if (isOpen) close();
      else open();
    }
  };

  useEffect(() => {
    window.addEventListener("keyup", onKeyDown);

    return () => {
      window.removeEventListener("keyup", onKeyDown);
    };
  }, [isOpen, inputFocus]);

  return (
    <Fragment>
      <div className={styles.game__overlay__button}>
        <Button variant="secondary" onClick={open}>
          <SignOut />
        </Button>
      </div>

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
    </Fragment>
  );
};

export default LeaveButton;
