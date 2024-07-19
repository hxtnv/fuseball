import styles from "./input.module.scss";

type InputProps = {
  label: string;
  placeholder?: string;
  value: string;
  setValue: (value: string) => void;
};

type InputRadioProps = InputProps & {
  options: string[];
};

export const Input: React.FC<InputProps> = ({
  label,
  value,
  setValue,
  placeholder,
}) => {
  return (
    <div className={styles.input}>
      <label>{label}</label>

      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
};

export const InputRadio: React.FC<InputRadioProps> = ({
  label,
  options,
  value,
  setValue,
}) => {
  return (
    <div className={styles.input}>
      <label>{label}</label>

      <div className={styles.input__radio}>
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
