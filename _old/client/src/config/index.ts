const config = {
  wsUrl: import.meta.env.VITE_API_WS_URL ?? "ws://localhost:8080",
  apiUrl: import.meta.env.VITE_API_URL ?? "http://localhost:8080",
  pingInterval: 1000,
};

export default config;
