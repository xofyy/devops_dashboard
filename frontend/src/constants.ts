// API
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Toast
export const TOAST_DURATION = 3000;
export const TOAST_COLORS = {
  error: "#f87171",
  success: "#4ade80",
  info: "#60a5fa",
};

// Tooltip
export const TOOLTIP_Z_INDEX = 9999;
export const TOOLTIP_OFFSET = 8;

// LocalStorage Keys
export const DOCKER_FAVORITES_KEY = "docker_favorites";
export const MONITORED_CONTAINERS_KEY = "monitoredContainers";

// Uyarı Eşikleri
export const CPU_ALERT_THRESHOLD = 80;
export const MEM_ALERT_THRESHOLD = 90;

// Diğer
export const DEFAULT_LOG_TAIL = 100; 