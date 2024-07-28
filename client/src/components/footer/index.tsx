import useModal from "@/hooks/use-modal/use-modal";
import styles from "./footer.module.scss";
import { Fragment } from "react/jsx-runtime";
import btc from "@/assets/payments/btc.png";
import eth from "@/assets/payments/eth.png";
import ltc from "@/assets/payments/ltc.png";
import paypal from "@/assets/payments/paypal.png";

type PaymentMethod = "BTC" | "ETH" | "LTC" | "PAYPAL";

const PAYMENT_ICON_MAP: Record<PaymentMethod, string> = {
  BTC: btc,
  ETH: eth,
  LTC: ltc,
  PAYPAL: paypal,
};

type DonationBoxProps = {
  method: PaymentMethod;
  text: string;
};

const DonationBox: React.FC<DonationBoxProps> = ({ method, text }) => {
  return (
    <div className={styles.footer__donation__box}>
      <div>
        <img src={PAYMENT_ICON_MAP[method]} alt={method} />
      </div>
      <p>{text}</p>
    </div>
  );
};

const Footer: React.FC = () => {
  const { open, Modal } = useModal();

  return (
    <Fragment>
      <div className={styles.footer}>
        <div className={styles.footer__content}>
          <p>
            Made with <span style={{ color: "#e25555" }}>❤</span> by{" "}
            <a
              href="https://github.com/hxtnv"
              target="_blank"
              rel="noopener noreferrer"
            >
              hxtnv
            </a>
          </p>

          <p>
            The game is open source and{" "}
            <a
              href="https://github.com/hxtnv/fuseball"
              target="_blank"
              rel="noopener noreferrer"
            >
              available on Github
            </a>
            .
          </p>

          <p>
            If you like the game, please{" "}
            <a role="button" onClick={open}>
              consider donating
            </a>{" "}
            to support the project.
          </p>
        </div>
      </div>

      <Modal title="Donate">
        <div className={styles.footer__donation}>
          <p>
            Fuseball is an open source project and servers are hosted using our
            own money. If you'd like to support us you can contribute to the
            code or donate using one of the following options.
          </p>

          <DonationBox
            method="BTC"
            text="bc1q0c5k4p7uwxktfpyrm3ffgnejaragukfvwvrgqq"
          />
          <DonationBox method="LTC" text="LQQF8SbLg9sg6vvmoQyFezmSyaLm4N77jM" />
          <DonationBox
            method="ETH"
            text="0xa11898241e07e0752e2abe648662e4433a084636"
          />
        </div>
      </Modal>
    </Fragment>
  );
};

export default Footer;
