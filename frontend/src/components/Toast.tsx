import { useEffect } from "react";
import { TOAST_DURATION, TOAST_COLORS } from "../constants";

interface ToastProps {
  message: string;
  type?: "error" | "success" | "info";
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type = "info", onClose, duration = TOAST_DURATION }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 9999,
        padding: "12px 24px",
        borderRadius: 8,
        background: TOAST_COLORS[type],
        color: "white",
        fontWeight: 600,
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        minWidth: 200,
        textAlign: "center",
      }}
      role="alert"
    >
      {message}
    </div>
  );
} 