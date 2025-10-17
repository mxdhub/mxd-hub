// hub-config.js — cấu hình client cho MXD Hub
// NOTE: Nếu Worker yêu cầu X-Key, điền vào X_KEY. Nếu không, để chuỗi rỗng.
window.HUB_CONFIG = {
  WORKER_URL: "https://<YOUR_WORKER>.workers.dev", // ví dụ: https://mxd-hub-api.xxx.workers.dev
  X_KEY: "" // "mxd-2025-super" (DEV ONLY; để trống nếu không muốn lộ key)
};
