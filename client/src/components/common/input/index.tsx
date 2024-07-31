import styles from "./input.module.scss";

type InputProps = {
  label: string;
  placeholder?: string;
  value: string;
  setValue: (value: string) => void;
  extraIcon?: React.ReactNode;
  extraIconOnClick?: () => void;
  maxLength?: number;
};

type InputRadioProps = InputProps & {
  options: string[];
  grid?: number;
};

export const Input: React.FC<InputProps> = ({
  label,
  value,
  setValue,
  placeholder,
  extraIcon,
  extraIconOnClick,
  maxLength,
}) => {
  return (
    <div className={styles.input}>
      <label>{label}</label>

      <div className={styles.input__wrapper}>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className={"generic-box"}
        />

        {extraIcon && (
          <div onClick={extraIconOnClick} className={styles.input__extra}>
            {extraIcon}
          </div>
        )}
      </div>
    </div>
  );
};

export const InputRadio: React.FC<InputRadioProps> = ({
  label,
  options,
  value,
  setValue,
  grid,
}) => {
  return (
    <div className={styles.input}>
      <label>{label}</label>

      <div
        className={styles.input__radio}
        style={
          grid
            ? { gridTemplateColumns: `repeat(${grid}, minmax(0, 1fr))` }
            : undefined
        }
      >
        {options.map((option, index) => (
          <div
            key={index}
            data-active={value.toString() === index.toString() || null}
            onClick={() => setValue(index.toString())}
          >
            {option}
          </div>
        ))}
      </div>
    </div>
  );
};
