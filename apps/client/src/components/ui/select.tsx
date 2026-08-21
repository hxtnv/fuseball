import { useEffect, useRef, useState } from "preact/hooks";
import { ChevronDown } from "lucide-react";
import styles from "./select.module.css";

export interface SelectOption {
  label: string;
  value: string;
  hint?: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  class?: string;
}

export function Select({
  options,
  value,
  onChange,
  label,
  placeholder = "Select…",
  class: cls = "",
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const selected = options.find((o) => o.value === value);

  return (
    <div class={`${styles.field} ${cls}`} ref={ref}>
      {label && <span class={styles.label}>{label}</span>}
      <button
        type="button"
        class={`ui-box ${styles.trigger}`}
        data-open={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span class={styles.value}>
          {selected ? (
            <>
              {selected.label}
              {selected.hint && (
                <span class={styles.hint}>{selected.hint}</span>
              )}
            </>
          ) : (
            <span class={styles.placeholder}>{placeholder}</span>
          )}
        </span>
        <span class={styles.chevron}>
          <ChevronDown size={18} />
        </span>
      </button>

      {open && (
        <div class={`ui-box ${styles.menu}`}>
          {options.map((o) => (
            <button
              type="button"
              key={o.value}
              class={styles.option}
              data-active={o.value === value}
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
            >
              <span>{o.label}</span>
              {o.hint && <span class={styles.hint}>{o.hint}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
