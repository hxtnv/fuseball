import styles from "./player-preview.module.scss";
import { Fragment } from "react";
import Lock from "@/assets/icons/lock-solid.svg?react";
import Ribbon from "@/assets/ribbon.svg?react";
import Button from "@/components/common/button";
import Skeleton from "@/components/common/skeleton";
import { useWebSocket } from "@/context/websocket.context";
import useModal from "@/hooks/use-modal/use-modal";
import SignInModal from "@/components/modals/sign-in";

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
  const { open, close, Modal } = useModal();
  const { open: openEdit, Modal: EditModal } = useModal();

  return (
    <Fragment>
      <Modal title="Sign in">
        <SignInModal open={open} close={close} />
      </Modal>

      <EditModal title="Edit profile">
        <p style={{ margin: "20px 0", textAlign: "center" }}>Coming soon!</p>
      </EditModal>

      <div className={`${styles.preview} generic-box`}>
        <div className={styles.preview__ribbon}>
          <Ribbon />
        </div>

        <div className={styles.preview__content}>
          {!playerData ? (
            <Fragment>
              <label>Playing as</label>
              <Skeleton style={{ height: "16px", width: "110px" }} />

              <div className={styles.preview__content__stats}>
                {["Total wins", "Total goals", "Win rate"].map((title, key) => (
                  <div key={key}>
                    <label>{title}</label>
                    <Skeleton style={{ height: "16px", width: "32px" }} />
                  </div>
                ))}
              </div>

              <Skeleton
                style={{ height: "42px", width: "100%", marginTop: "15px" }}
              />
            </Fragment>
          ) : (
            <Fragment>
              <label>Playing as</label>
              <h4>{playerData.name}</h4>

              <div className={styles.preview__content__stats}>
                <StatBox
                  title="Total wins"
                  value={playerData.total_wins}
                  locked={!playerData.authenticated}
                />
                <StatBox
                  title="Total goals"
                  value={playerData.total_goals}
                  locked={!playerData.authenticated}
                />
                <StatBox
                  title="Win rate"
                  value={`${
                    playerData.total_games === 0
                      ? 0
                      : (
                          (playerData.total_wins / playerData.total_games ||
                            1) * 100
                        ).toFixed(1)
                  }%`}
                  locked={!playerData.authenticated}
                />
              </div>

              {playerData.authenticated ? (
                <Button variant="secondary" size="small" onClick={openEdit}>
                  Edit profile
                </Button>
              ) : (
                <Button variant="primary" size="small" onClick={open}>
                  Sign in to unlock stats
                </Button>
              )}
            </Fragment>
          )}
        </div>
      </div>
    </Fragment>
  );
};

export default PlayerPreview;
