import useModal from "@/hooks/use-modal/use-modal";
import styles from "./navbar.module.scss";
import { Fragment } from "react";
import logo from "@/assets/logo.png";
import Button from "@/components/common/button";
import { useWebSocket } from "@/context/websocket.context";
import SignInModal from "@/components/modals/sign-in";

const Navbar: React.FC = () => {
  const {
    open: openSignIn,
    close: closeSignIn,
    Modal: ModalSignIn,
  } = useModal();
  const {
    open: openSignOut,
    close: closeSignOut,
    Modal: ModalSignOut,
  } = useModal();

  const { status, playerData, signOut } = useWebSocket();

  const signOutClicked = () => {
    closeSignOut();
    signOut();
  };

  return (
    <Fragment>
      <ModalSignIn title="Sign in">
        <SignInModal open={openSignIn} close={closeSignIn} />
      </ModalSignIn>

      <ModalSignOut title="Sign out">
        <p style={{ margin: "20px 0", textAlign: "center" }}>
          Are you sure you want to sign out?
        </p>

        <div style={{ display: "flex", gap: "10px" }}>
          <Button variant="secondary" onClick={closeSignOut}>
            No, go back
          </Button>
          <Button onClick={signOutClicked}>Yes, sign out</Button>
        </div>
      </ModalSignOut>

      <div className={styles.navbar}>
        <div className={styles.navbar__inner}>
          <div className={styles.navbar__logo}>
            <img src={logo} alt="Fuseball logo" />
          </div>

          {status === "connected" && (
            <div className={styles.navbar__links}>
              {playerData?.authenticated ? (
                <Button variant="secondary" size="small" onClick={openSignOut}>
                  Sign out
                </Button>
              ) : (
                <Button size="small" onClick={openSignIn}>
                  Sign in
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Fragment>
  );
};

export default Navbar;
