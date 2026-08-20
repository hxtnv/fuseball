import { createContext } from "react";
import type { AuthMeResponse } from "shared/types/api";

export const AuthContext = createContext<{
  details: AuthMeResponse["details"] | null;
  isLoading: boolean;
}>({
  details: null,
  isLoading: false,
});
