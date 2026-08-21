import type { ComponentChildren } from "preact";
import { useEffect } from "preact/hooks";
import { X } from "lucide-react";
import styles from "./modal.module.css";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ComponentChildren;
  width?: string | number;
  children?: ComponentChildren;
}

export function Modal({ open, onClose, title, width, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div class={styles.backdrop} onClick={onClose}>
      <div
        class={`ui-box ${styles.modal}`}
        style={{ width: typeof width === "number" ? `${width}px` : width }}
        onClick={(e) => e.stopPropagation()}
      >
        <div class={styles.header}>
          <h4>{title}</h4>
          <button class={styles.close} onClick={onClose} title="Close">
            <X size={18} />
          </button>
        </div>
        <div class={styles.content}>{children}</div>
      </div>
    </div>
  );
}
