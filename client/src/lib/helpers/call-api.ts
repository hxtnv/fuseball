export type Props = {
  method?: string;
  data?: any;
};

const callAPI = async (url: string, props: Props = {}) => {
  return new Promise((resolve, reject) => {
    const method = props.method ?? "POST";

    fetch(url, {
      method,
      headers: new Headers({
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("fuseball:jwt") ?? "",
      }),
      body:
        method !== "GET" && props.data ? JSON.stringify(props.data) : undefined,
    })
      .then((res) => res.json())
      .then(resolve)
      .catch(reject);
  });
};

export default callAPI;
