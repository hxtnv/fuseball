import type { ComponentChildren } from "preact";
import { useEffect, useState } from "preact/hooks";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import styles from "./modal.module.scss";

interface ModalTitle {
  text: string;
  icon?: ComponentChildren;
}

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ModalTitle;
  width?: string | number;
  children?: ComponentChildren;
}

export const Modal = ({
  open,
  onClose,
  title,
  width,
  children,
}: ModalProps) => {
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);

  // keep the modal mounted through its exit animation
  useEffect(() => {
    if (open) {
      setMounted(true);
      setClosing(false);
      return;
    }
    if (!mounted) return;
    setClosing(true);
    const t = setTimeout(() => {
      setMounted(false);
      setClosing(false);
    }, 200);
    return () => clearTimeout(t);
  }, [open, mounted]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted) return null;

  return (
    <div
      class={cn(styles.modal, closing && styles["modal--closing"])}
      onClick={onClose}
    >
      <div
        class={cn("ui-box", styles.modal__window)}
        style={{ width: typeof width === "number" ? `${width}px` : width }}
        onClick={(e) => e.stopPropagation()}
      >
        <div class={styles.modal__window__header}>
          <h4 class={styles.modal__window__header__title}>
            {title?.icon}
            {title?.text}
          </h4>
          <button
            class={styles.modal__window__header__close}
            onClick={onClose}
            title="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div class={styles.modal__window__body}>{children}</div>
      </div>
    </div>
  );
};
