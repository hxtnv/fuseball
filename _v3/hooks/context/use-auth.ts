import { useContext } from "react";
import { AuthContext } from "@/context/auth-context";

const useAuthContext = () => useContext(AuthContext);

export default useAuthContext;
