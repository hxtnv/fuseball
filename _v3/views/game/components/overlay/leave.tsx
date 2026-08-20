import { Fragment, useEffect } from "react";
import { LogOutIcon } from "lucide-react";
import Button from "@/components/common/button";
import styles from "./overlay.module.scss";
import useModal from "@/hooks/use-modal";
import useApiQuery from "@/hooks/use-api-query";
import useGameServerContext from "@/hooks/context/use-game-server";
import { useNavigate } from "react-router-dom";

const Leave = () => {
  const navigate = useNavigate();
  const { selectedServer } = useGameServerContext();
  const { show, hide, visibility, Modal } = useModal();

  const { refetch } = useApiQuery(
    selectedServer ? `${selectedServer.http}/leave` : "/leave",
    {
      method: "POST",
      onSuccess: () => {
        navigate("/");
      },
      enabled: false,
    }
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && visibility === "hidden") {
        show();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [visibility, show]);

  return (
    <Fragment>
      <Modal title="Leave game" hide={hide} visibility={visibility} width={400}>
        <p className={styles.overlay__leave__text}>
          Are you sure you want to leave the game? You won't be able to rejoin
          this match and your progress will not be saved.
        </p>

        <div className={styles.overlay__leave__buttons}>
          <Button variant="secondary" onClick={hide}>
            Stay
          </Button>
          <Button variant="danger" onClick={refetch}>
            Leave
          </Button>
        </div>
      </Modal>

      <Button
        variant="secondary"
        className={styles.overlay__leave}
        onClick={show}
      >
        <LogOutIcon />
      </Button>
    </Fragment>
  );
};

export default Leave;
