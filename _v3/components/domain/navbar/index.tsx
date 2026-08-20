// import useModal from "@/hooks/use-modal/use-modal";
import styles from "./navbar.module.scss";
import { Fragment } from "react";
import logo from "@/assets/logo.png";
import Button from "@/components/common/button";
import useModal from "@/hooks/use-modal";
import SignInModal from "@/components/modals/sign-in";
import badgeBase from "@/assets/levels/base.png";
import useAuthContext from "@/hooks/context/use-auth";

const UserQuickPreview = () => {
  const { details } = useAuthContext();

  return (
    <div className={`${styles.navbar__user} generic-box`}>
      <div className={styles.navbar__user__badge}>
        <img src={badgeBase} alt="" />
        <p>1</p>
      </div>

      <div className={styles.navbar__user__info}>
        <h4>{details?.displayName}</h4>

        <div className={`${styles.navbar__user__info__level} generic-box`}>
          <div />
        </div>
      </div>
    </div>
  );
};

const Navbar: React.FC = () => {
  const {
    show: showSignIn,
    hide: hideSignIn,
    visibility: signInVisibility,
    Modal: SignInModalWrapper,
  } = useModal();
  // const {
  //   open: openSignIn,
  //   close: closeSignIn,
  //   Modal: ModalSignIn,
  // } = useModal();
  // const {
  //   open: openSignOut,
  //   close: closeSignOut,
  //   Modal: ModalSignOut,
  // } = useModal();

  // const { status, playerData, signOut } = useWebSocket();

  // const signOutClicked = () => {
  //   closeSignOut();
  //   signOut();
  // };

  return (
    <Fragment>
      <SignInModalWrapper visibility={signInVisibility} hide={hideSignIn}>
        <SignInModal hide={hideSignIn} />
      </SignInModalWrapper>
      {/* <ModalSignIn title="Sign in">
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
      </ModalSignOut> */}

      <div className={styles.navbar}>
        <UserQuickPreview />

        <div className={styles.navbar__logo}>
          <img src={logo} alt="Fuseball logo" />

          {/* {status === "connected" && (
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
          )} */}
        </div>

        <div className={styles.navbar__actions}>
          <Button size="small" onClick={showSignIn}>
            Sign in
          </Button>
        </div>
      </div>
    </Fragment>
  );
};

export default Navbar;
