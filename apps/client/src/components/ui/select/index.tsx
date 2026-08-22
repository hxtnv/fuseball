import { useEffect, useRef, useState } from "preact/hooks";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import styles from "./select.module.scss";

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

export const Select = ({
  options,
  value,
  onChange,
  label,
  placeholder = "Select…",
  class: cls,
}: SelectProps) => {
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
    <div class={cn(styles.select, cls)} ref={ref}>
      {label && <span class={styles.select__label}>{label}</span>}
      <button
        type="button"
        class={cn("ui-box", styles.select__trigger)}
        data-open={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span class={styles.select__value}>
          {selected ? (
            <>
              {selected.label}
              {selected.hint && (
                <span class={styles.select__hint}>{selected.hint}</span>
              )}
            </>
          ) : (
            <span class={styles.select__placeholder}>{placeholder}</span>
          )}
        </span>
        <span class={styles.select__chevron}>
          <ChevronDown size={18} />
        </span>
      </button>

      {open && (
        <div class={cn("ui-box", styles.select__menu)}>
          {options.map((o) => (
            <button
              type="button"
              key={o.value}
              class={styles.select__option}
              data-active={o.value === value}
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
            >
              <span>{o.label}</span>
              {o.hint && <span class={styles.select__hint}>{o.hint}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
