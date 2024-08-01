import useModal from "@/hooks/use-modal/use-modal";
import styles from "./navbar.module.scss";
import { Fragment } from "react";
import logo from "@/assets/logo.png";
import Button from "@/components/common/button";

const Navbar: React.FC = () => {
  const { open, Modal } = useModal();

  return (
    <Fragment>
      <Modal title="Sign in">
        <p style={{ margin: "20px 0", textAlign: "center" }}>
          Work in progress
        </p>
      </Modal>

      <div className={styles.navbar}>
        <div className={styles.navbar__inner}>
          <div className={styles.navbar__logo}>
            <img src={logo} alt="Fuseball logo" />
          </div>

          <div className={styles.navbar__links}>
            <Button size="small" onClick={open}>
              Sign in
            </Button>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default Navbar;
