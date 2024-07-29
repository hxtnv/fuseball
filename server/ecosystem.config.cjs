module.exports = {
  apps: [
    {
      name: "fuseball-server",
      script: "npm",
      args: "run start",
      env: {
        NODE_ENV: "production",
        PORT: 443,
      },
    },
  ],
};
