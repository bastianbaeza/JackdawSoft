module.exports = {
  apps: [
    {
      name: "jackdaws-backend",
      script: "src/index.js",
      instances: "max",
      exec_mode: "cluster",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
      exp_backoff_restart_delay: 100,
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      out_file: "./logs/out.log",
      error_file: "./logs/error.log",
      time: true,
    },
  ],
};
