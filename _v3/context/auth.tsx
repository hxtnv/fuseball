import { AuthContext } from "./auth-context";
import useApiQuery from "@/hooks/use-api-query";
import StorageKeys from "@/lib/const/storage-keys";
import type { AuthMeResponse } from "shared/types/api";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data, isLoading } = useApiQuery<AuthMeResponse>("/oauth/me", {
    method: "POST",
    onSuccess: (data) => {
      localStorage.setItem(StorageKeys.JWT, data.jwt);
    },
  });

  return (
    <AuthContext.Provider value={{ details: data?.details ?? null, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
