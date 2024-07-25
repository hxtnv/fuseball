import { useState, useEffect, useMemo } from "react";
import X from "@/assets/icons/x-solid.svg?react";
import styles from "./modal.module.scss";
import Button from "@/components/common/button";

type VisibilityState = "hidden" | "visible" | "halfway-out";
type ModalProps = {
  children: React.ReactNode;
  title?: string;
  hideCloseButton?: boolean;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  showFooter?: boolean;
  hideCancelButton?: boolean;
};
type UseModalArgs = {
  onClose?: () => void;
  onOpen?: () => void;
  noEscapeClose?: boolean;
};

const useModal = ({ noEscapeClose }: UseModalArgs = {}) => {
  const [visibility, setVisibility] = useState<VisibilityState>("hidden");

  const open = () => {
    setVisibility("visible");
    // onOpen?.();
  };
  const close = () => {
    setVisibility("hidden");
    // onClose?.();
  };

  const Modal = ({
    children,
    hideCloseButton,
    title,
    onConfirm,
    confirmText,
    cancelText,
    showFooter,
    hideCancelButton,
  }: ModalProps) => {
    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          if (noEscapeClose || hideCloseButton) {
            return;
          }

          close();
        } else if (event.key === "Enter") {
          if (visibility !== "visible") {
            return;
          }

          onConfirm?.();
        }
      };

      document.addEventListener("keydown", handleKeyDown);

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }, []);

    if (visibility === "hidden") return null;

    return (
      <div className={styles.modal} data-visibility={visibility}>
        <div
          className={styles.modal__overlay}
          onClick={hideCloseButton ? undefined : close}
        />

        <div className={styles.modal__content}>
          <div className={styles.modal__content__header}>
            {title && (
              <p className={styles.modal__content__header__title}>{title}</p>
            )}

            {!hideCloseButton && (
              <button
                className={styles.modal__content__header__close}
                style={title ? undefined : { marginLeft: "auto" }}
                onClick={close}
              >
                <X />
              </button>
            )}
          </div>

          <div className={styles.modal__content__body}>{children}</div>

          {showFooter && (
            <div className={styles.modal__content__footer}>
              {!hideCancelButton && (
                <Button variant="secondary" onClick={close}>
                  {cancelText ?? "Cancel"}
                </Button>
              )}

              <Button onClick={onConfirm}>{confirmText ?? "Confirm"}</Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const memoizedModal = useMemo(() => Modal, [visibility]);

  // useEffect(() => {
  //   if (visibility === "visible") {
  //     onOpen?.();
  //   } else if (visibility === "hidden") {
  //     onClose?.();
  //   }
  // }, [visibility]);

  return {
    Modal: memoizedModal,
    open,
    close,
    isOpen: visibility === "visible",
  };
};

export default useModal;
