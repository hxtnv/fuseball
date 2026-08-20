import { useState, useEffect, useCallback, useRef } from "react";
import apiWrapper from "../lib/api-wrapper";
import { ApiCallError } from "../lib/api-wrapper";

type UseApiQueryOptions<T> = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown[] | Record<string, unknown>;
  headers?: Record<string, string>;
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: ApiCallError<T>) => void;
};

type UseApiQueryResult<T> = {
  data: T | null;
  isLoading: boolean;
  isError: boolean;
  error: ApiCallError<T> | null;
  refetch: (overwriteUrl?: string) => Promise<void>;
};

/**
 * A custom hook for making API requests
 *
 * @param url The API endpoint to call
 * @param options Options for the API call
 * @returns Object containing data, loading state, errors, and refetch function
 *
 * @example
 * const { data, isLoading, isError, error, refetch } = useApiQuery<UserData>('/users/me', {
 *   enabled: true,
 *   onSuccess: (data) => console.log('User data:', data)
 * });
 */
export function useApiQuery<T>(
  url: string,
  options: UseApiQueryOptions<T> = {}
): UseApiQueryResult<T> {
  const {
    method = "GET",
    body,
    headers,
    enabled = true,
    onSuccess,
    onError,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(enabled);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<ApiCallError<T> | null>(null);

  // Store callbacks in refs to prevent unnecessary re-renders
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  // Update refs when callbacks change
  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [onSuccess, onError]);

  const fetchData = useCallback(
    async (overwriteUrl?: string) => {
      setIsLoading(true);
      setIsError(false);
      setError(null);

      try {
        let result: T;

        switch (method) {
          case "GET":
            result = await apiWrapper.get<T>(overwriteUrl ?? url, { headers });
            break;
          case "POST":
            result = await apiWrapper.post<T>(overwriteUrl ?? url, {
              headers,
              body,
            });
            break;
          case "PUT":
            result = await apiWrapper.put<T>(overwriteUrl ?? url, {
              headers,
              body,
            });
            break;
          case "PATCH":
            result = await apiWrapper.patch<T>(overwriteUrl ?? url, {
              headers,
              body,
            });
            break;
          case "DELETE":
            result = await apiWrapper.delete<T>(overwriteUrl ?? url, {
              headers,
              body,
            });
            break;
          default:
            result = await apiWrapper.get<T>(overwriteUrl ?? url, { headers });
        }

        setData(result);
        // Use the ref's current value instead of the direct prop
        if (onSuccessRef.current) {
          onSuccessRef.current(result);
        }
      } catch (err) {
        setIsError(true);
        const apiError = err as ApiCallError<T>;
        setError(apiError);
        // Use the ref's current value instead of the direct prop
        if (onErrorRef.current) {
          onErrorRef.current(apiError);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [url, method, headers, body]
  ); // Remove onSuccess and onError from dependencies

  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [enabled, fetchData]);

  const refetch = useCallback(
    async (overwriteUrl?: string) => {
      await fetchData(
        typeof overwriteUrl === "string" ? overwriteUrl : undefined
      );
    },
    [fetchData]
  );

  return { data, isLoading, isError, error, refetch };
}

export default useApiQuery;
