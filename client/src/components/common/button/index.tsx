import styles from "./button.module.scss";

type Props = {
  children: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  loading?: boolean;
};

const Button: React.FC<Props> = ({
  children,
  style,
  onClick,
  disabled,
  variant,
  loading,
}) => {
  return (
    <button
      onClick={onClick}
      className={styles.btn}
      data-variant={variant ?? "primary"}
      style={style}
      disabled={disabled || loading}
    >
      {loading ? "Loading..." : children}
    </button>
  );
};

export default Button;
