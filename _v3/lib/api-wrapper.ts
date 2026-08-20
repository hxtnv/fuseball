import { API_URL } from "./const/api";
import StorageKeys from "./const/storage-keys";
import type { ApiResponse } from "shared/types/api";

type ApiCallOptions = {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown[] | Record<string, unknown>;
};

export class ApiCallError<T> extends Error {
  data?: T;

  constructor(message: string, data?: T) {
    super(message);
    this.name = "ApiCallError";
    this.data = data;
  }
}

const apiCall = async <T>(
  url: string,
  options?: ApiCallOptions
): Promise<T> => {
  const { method = "GET", headers = {}, body } = options ?? {};

  try {
    const jwt = localStorage.getItem(StorageKeys.JWT);
    const authHeaders: ApiCallOptions["headers"] = jwt
      ? {
          Authorization: ["Bearer ", jwt].join(""),
        }
      : {};

    const requestHeaders: ApiCallOptions["headers"] = {
      "Content-Type": "application/json",
      ...authHeaders,
      ...headers,
    };

    const finalUrl =
      url.startsWith("http://") || url.startsWith("https://")
        ? url
        : `${API_URL}${url}`;

    const response = await fetch(finalUrl, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    const responseData: ApiResponse<T> = await response.json();
    const { data, success, message } = responseData;

    if (!data || !success || ![200, 201, 204].includes(response.status)) {
      throw new ApiCallError<T>(message || "INTERNAL_SERVER_ERROR", data);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiCallError) {
      throw error;
    }

    throw new ApiCallError<T>(
      error instanceof Error ? error.message : "INTERNAL_SERVER_ERROR",
      undefined
    );
  }
};

const apiWrapper = {
  get: <T>(url: string, options?: ApiCallOptions) =>
    apiCall<T>(url, { ...options, method: "GET" }),
  post: <T>(url: string, options: ApiCallOptions) =>
    apiCall<T>(url, { ...options, method: "POST" }),
  put: <T>(url: string, options: ApiCallOptions) =>
    apiCall<T>(url, { ...options, method: "PUT" }),
  patch: <T>(url: string, options: ApiCallOptions) =>
    apiCall<T>(url, { ...options, method: "PATCH" }),
  delete: <T>(url: string, options: ApiCallOptions) =>
    apiCall<T>(url, { ...options, method: "DELETE" }),
};

export default apiWrapper;
