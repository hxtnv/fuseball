const config = {
  wsUrl: import.meta.env.VITE_API_WS_URL ?? "ws://192.168.238.71:8080",
  pingInterval: 1000,
};

export default config;
