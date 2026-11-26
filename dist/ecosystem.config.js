module.exports = {
  apps: [
    {
      name: "stsm-frontend",
      script: "server.js",
      cwd: "./",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        PORT: 5130,
        NODE_ENV: "production"
      }
    },
    {
      name: "stsm-backend",
      script: "server/index.js",
      cwd: "./",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        PORT: 3001,
        NODE_ENV: "production"
      }
    }
  ]
};
