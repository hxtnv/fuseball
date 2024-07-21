import styles from "./footer.module.scss";

const Footer: React.FC = () => {
  return (
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
      </div>
    </div>
  );
};

export default Footer;
