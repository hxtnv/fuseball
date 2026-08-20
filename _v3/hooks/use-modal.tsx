import { useEffect, useState, memo } from "react";
import Modal from "@/components/common/modal";

export type Visibility = "hidden" | "visible" | "halfway-out";

type ModalWrapperProps = {
  children: React.ReactNode;
  // shared
  title?: string;
  width?: string | number;
  visibility: Visibility;
  hide: () => void;
};

const ModalWrapper = memo(
  ({ children, title, width, visibility, hide }: ModalWrapperProps) => {
    return (
      <Modal visibility={visibility} hide={hide} title={title} width={width}>
        {children}
      </Modal>
    );
  }
);

const useModal = () => {
  const [visibility, setVisibility] = useState<Visibility>("hidden");

  const show = () => {
    setVisibility("visible");
  };

  const hide = () => {
    setVisibility("halfway-out");
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && visibility === "visible") {
        hide();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [visibility]);

  useEffect(() => {
    document.body.style.overflow = visibility === "hidden" ? "" : "hidden";

    if (["hidden", "visible"].includes(visibility)) {
      return;
    }

    const animationTimeout = setTimeout(() => {
      setVisibility("hidden");
      clearTimeout(animationTimeout);
    }, 300);

    return () => {
      clearTimeout(animationTimeout);
    };
  }, [visibility]);

  return {
    show,
    hide,
    Modal: ModalWrapper,
    visibility,
  };
};

export default useModal;
