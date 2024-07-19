import styles from "./button.module.scss";

type Props = {
  children: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
  disabled?: boolean;
  variant?: "primary" | "secondary";
};

const Button: React.FC<Props> = ({
  children,
  style,
  onClick,
  disabled,
  variant,
}) => {
  return (
    <button
      onClick={onClick}
      className={styles.btn}
      data-variant={variant ?? "primary"}
      style={style}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
