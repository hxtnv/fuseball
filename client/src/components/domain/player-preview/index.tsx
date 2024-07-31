import styles from "./player-preview.module.scss";
import { Fragment } from "react";
import Lock from "@/assets/icons/lock-solid.svg?react";
import Ribbon from "@/assets/ribbon.svg?react";
import Button from "@/components/common/button";
import { useWebSocket } from "@/context/websocket.context";
import useModal from "@/hooks/use-modal/use-modal";

type StatBoxProps = {
  title: string;
  value: string | number;
  locked?: boolean;
};

const StatBox: React.FC<StatBoxProps> = ({ title, value, locked }) => {
  return (
    <div>
      <label>{title}</label>

      {locked ? <Lock /> : <p>{value}</p>}
    </div>
  );
};

const PlayerPreview: React.FC = () => {
  const { playerData } = useWebSocket();
  const { open, Modal } = useModal();

  if (!playerData) return null;

  return (
    <Fragment>
      <Modal title="Sign in">
        <p style={{ margin: "20px 0", textAlign: "center" }}>
          Work in progress
        </p>
      </Modal>

      <div className={`${styles.preview} generic-box`}>
        <div className={styles.preview__ribbon}>
          <Ribbon />
        </div>

        <div className={styles.preview__content}>
          <label>Playing as</label>
          <h4>{playerData.name}</h4>

          <div className={styles.preview__content__stats}>
            <StatBox title="Total wins" value={5} locked={true} />
            <StatBox title="Total goals" value={100} locked={true} />
            <StatBox title="Win rate" value={"78%"} locked={true} />
          </div>

          <Button variant="primary" size="small" onClick={open}>
            Sign in to unlock stats
          </Button>
        </div>
      </div>
    </Fragment>
  );
};

export default PlayerPreview;
