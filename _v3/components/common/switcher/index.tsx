import styles from "./switcher.module.scss";

type Props = {
  options: {
    label: string;
    key: string;
    color?: string;
  }[];
  value: string;
  setValue: (value: string) => void;
  style?: React.CSSProperties;
};

const Switcher: React.FC<Props> = ({ options, value, setValue, style }) => {
  return (
    <div className={styles.switcher} style={style}>
      {options.map(({ label, key, color }, index) => (
        <div
          key={index}
          style={color ? { color } : undefined}
          onClick={() => setValue(key)}
          data-active={value === key || null}
        >
          {label}
        </div>
      ))}
    </div>
  );
};

export default Switcher;
