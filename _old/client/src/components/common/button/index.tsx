import { Fragment } from "react";
import styles from "./button.module.scss";
import Fan from "@/assets/icons/fan-solid.svg?react";

type Props = {
  children: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  loading?: boolean;
  size?: "small" | "medium" | "large";
};

const Button: React.FC<Props> = ({
  children,
  style,
  onClick,
  disabled,
  variant,
  loading,
  size,
}) => {
  return (
    <button
      onClick={onClick}
      className={`${styles.btn} generic-box`}
      data-variant={variant ?? "primary"}
      data-size={size}
      style={style}
      disabled={disabled || loading}
    >
      {loading ? (
        <Fragment>
          <Fan className={styles.btn__loading} />
          <span>Loading...</span>
        </Fragment>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
