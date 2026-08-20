import { useEffect, useState } from "react";

const useCheckMobileScreen = () => {
  const [isMobile, setIsMobile] = useState<boolean>(
    window.innerWidth <= 768 || window.innerHeight <= 768
  );

  const handleWindowSizeChange = () => {
    setIsMobile(window.innerWidth <= 768 || window.innerHeight <= 768);
  };

  useEffect(() => {
    window.addEventListener("resize", handleWindowSizeChange);

    return () => {
      window.removeEventListener("resize", handleWindowSizeChange);
    };
  }, []);

  return isMobile;
};

export default useCheckMobileScreen;
