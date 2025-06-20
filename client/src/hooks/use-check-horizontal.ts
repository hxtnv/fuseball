import { useEffect, useState } from "react";

const useCheckHorizontal = () => {
  const getIsHorizontal = () => {
    return window.matchMedia("(orientation: landscape)").matches;
  };

  const [isHorizontal, setIsHorizontal] = useState<boolean>(getIsHorizontal());

  useEffect(() => {
    const updateOrientation = () => {
      setIsHorizontal(getIsHorizontal());
    };

    updateOrientation();

    window.addEventListener("orientationchange", updateOrientation);
    window.addEventListener("resize", updateOrientation);

    return () => {
      window.removeEventListener("orientationchange", updateOrientation);
      window.removeEventListener("resize", updateOrientation);
    };
  }, []);

  return isHorizontal;
};

export default useCheckHorizontal;
