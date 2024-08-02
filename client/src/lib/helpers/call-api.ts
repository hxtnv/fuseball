import config from "@/config";

export type Props = {
  method?: string;
  data?: any;
};

const callAPI = async (url: string, props: Props = {}) => {
  return new Promise((resolve, reject) => {
    const method = props.method ?? "POST";

    fetch(`${config.apiUrl}${url}`, {
      method,
      headers: new Headers({
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("fuseball:jwt") ?? "",
      }),
      body:
        method !== "GET" && props.data ? JSON.stringify(props.data) : undefined,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          resolve(data);
        } else {
          reject(data);
        }
      })
      .catch(reject);
  });
};

export default callAPI;
