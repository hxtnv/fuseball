import { useState, useEffect, useMemo } from "react";
import X from "@/assets/icons/x-solid.svg?react";
import styles from "./modal.module.scss";

type VisibilityState = "hidden" | "visible" | "halfway-out";
type ModalProps = {
  children: React.ReactNode;
  title?: string;
  hideCloseButton?: boolean;
};
type UseModalArgs = {
  onClose?: () => void;
  onOpen?: () => void;
};

const useModal = ({ onClose, onOpen }: UseModalArgs = {}) => {
  const [visibility, setVisibility] = useState<VisibilityState>("hidden");

  const open = () => setVisibility("visible");
  const close = () => setVisibility("hidden");

  const Modal = ({ children, hideCloseButton, title }: ModalProps) => {
    if (visibility === "hidden") return null;

    return (
      <div className={styles.modal} data-visibility={visibility}>
        <div className={styles.modal__overlay} onClick={close} />

        <div className={styles.modal__content}>
          <div className={styles.modal__content__header}>
            {title && (
              <p className={styles.modal__content__header__title}>{title}</p>
            )}

            {!hideCloseButton && (
              <button
                className={styles.modal__content__header__close}
                onClick={close}
              >
                <X />
              </button>
            )}
          </div>

          <div className={styles.modal__content__body}>{children}</div>
        </div>
      </div>
    );
  };

  const memoizedModal = useMemo(() => Modal, [visibility]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (visibility === "visible") {
      onOpen?.();
    } else if (visibility === "hidden") {
      onClose?.();
    }
  }, [visibility]);

  return {
    Modal: memoizedModal,
    open,
    close,
  };
};

export default useModal;
