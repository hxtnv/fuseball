import { createPortal } from "react-dom";
import { XIcon } from "lucide-react";
import type { Visibility } from "@/hooks/use-modal";
import styles from "./modal.module.scss";
import { memo } from "react";

type Props = {
  visibility: Visibility;
  children: React.ReactNode;
  hide: () => void;
  // shared
  title?: string;
  width?: string | number;
};

const Modal = memo(({ visibility, children, hide, title, width }: Props) => {
  if (visibility === "hidden") return null;

  return createPortal(
    <>
      <div
        className={styles.backdrop}
        data-visibility={visibility}
        onClick={hide}
      >
        <div
          className={`${styles.modal} generic-box`}
          onClick={(e) => e.stopPropagation()}
          style={{
            width,
          }}
        >
          <div className={styles.modal__header}>
            <h4>{title}</h4>
            <XIcon onClick={hide} />
          </div>
          <div className={styles.modal__content}>{children}</div>
        </div>
      </div>
    </>,
    document.body
  );
});

export default Modal;
