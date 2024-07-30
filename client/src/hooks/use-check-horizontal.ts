import { useEffect, useState } from "react";

const useCheckHorizontal = () => {
  const [isHorizontal, setIsHorizontal] = useState<boolean>(
    screen.availWidth > screen.availHeight
  );

  const handleOrientationChange = () => {
    setIsHorizontal(screen.availWidth > screen.availHeight);
  };

  useEffect(() => {
    window.addEventListener("orientationchange", handleOrientationChange);

    return () => {
      window.removeEventListener("orientationchange", handleOrientationChange);
    };
  }, []);

  return isHorizontal;
};

export default useCheckHorizontal;
