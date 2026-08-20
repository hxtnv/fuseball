import styles from "./player-preview.module.scss";
import { Fragment } from "react";
// import Lock from "@/assets/icons/lock-solid.svg?react";
import Ribbon from "@/assets/ribbon.svg?react";
import Button from "@/components/common/button";
import Skeleton from "@/components/common/skeleton";
import { LockIcon } from "lucide-react";
import SignInModal from "@/components/modals/sign-in";
import useModal from "@/hooks/use-modal";
import useAuthContext from "@/hooks/context/use-auth";
// import { useWebSocket } from "@/context/websocket.context";
// import useModal from "@/hooks/use-modal/use-modal";

type StatBoxProps = {
  title: string;
  value: string | number;
  locked?: boolean;
};

const StatBox: React.FC<StatBoxProps> = ({ title, value, locked }) => {
  return (
    <div>
      <label>{title}</label>

      {locked ? <LockIcon color="#d93a3a" /> : <p>{value}</p>}
    </div>
  );
};

const PlayerPreview: React.FC = () => {
  const { details } = useAuthContext();
  const {
    show: showSignIn,
    hide: hideSignIn,
    visibility: signInVisibility,
    Modal: SignInModalWrapper,
  } = useModal();

  // const { open: openEdit, Modal: EditModal } = useModal();

  // const playerData = {
  //   name: "Guest_43209",
  //   total_wins: 10,
  //   total_goals: 10,
  //   total_games: 10,
  //   authenticated: false,
  // };

  return (
    <Fragment>
      <SignInModalWrapper visibility={signInVisibility} hide={hideSignIn}>
        <SignInModal hide={hideSignIn} />
      </SignInModalWrapper>

      {/*
      <EditModal title="Edit profile">
        <p style={{ margin: "20px 0", textAlign: "center" }}>Coming soon!</p>
      </EditModal> */}

      <div className={`${styles.preview} generic-box`}>
        <div className={styles.preview__ribbon}>
          <Ribbon />
        </div>

        <div className={styles.preview__content}>
          {!details ? (
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
              <h4>{details?.displayName}</h4>

              <div className={styles.preview__content__stats}>
                <StatBox
                  title="Total wins"
                  value={0}
                  locked={!details?.authenticated}
                />
                <StatBox
                  title="Total goals"
                  value={0}
                  locked={!details?.authenticated}
                />
                {/* <StatBox
                  title="Win rate"
                  value={`${
                    details?.total_games === 0
                      ? 0
                      : (
                          (details?.total_wins / details?.total_games ||
                            1) * 100
                        ).toFixed(1)
                  }%`}
                  locked={!details?.authenticated}
                /> */}
                <StatBox
                  title="Win rate"
                  value={`0%`}
                  locked={!details?.authenticated}
                />
              </div>

              {details?.authenticated ? (
                <Button variant="secondary" size="small">
                  Edit profile
                </Button>
              ) : (
                <Button variant="primary" size="small" onClick={showSignIn}>
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
