import { useState, useEffect, useCallback } from "react";
import callAPI, { Props } from "@/lib/helpers/call-api";

const useCallAPI = (url: string, props: Props = {}) => {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetch = useCallback(() => {
    setLoading(true);

    callAPI(url, props)
      .then((res) => setData(res))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [url, props]);

  useEffect(() => {
    fetch();
  }, [url, JSON.stringify(props)]);

  return {
    data,
    error,
    loading,
    fetch,
  };
};

export default useCallAPI;
