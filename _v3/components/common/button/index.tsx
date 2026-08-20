import { Fragment } from "react";
import styles from "./button.module.scss";
import { Loader2Icon } from "lucide-react";
// import Fan from "@/assets/icons/fan-solid.svg?react";

type Props = {
  children: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
  loading?: boolean;
  size?: "small" | "medium" | "large";
  className?: string;
};

const Button: React.FC<Props> = ({
  children,
  style,
  onClick,
  disabled,
  variant,
  loading,
  size,
  className,
}) => {
  return (
    <button
      onClick={onClick}
      className={`generic-box ${styles.btn} ${className ?? ""}`}
      data-variant={variant ?? "primary"}
      data-size={size}
      style={style}
      disabled={disabled || loading}
    >
      {loading ? (
        <Fragment>
          <Loader2Icon className={styles.btn__loading} />
          <span>Loading...</span>
        </Fragment>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
