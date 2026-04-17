// hooks/useToastSimple.jsx
import React, { useCallback } from "react";
import { createRoot } from "react-dom/client";
import { CheckCircle, AlertTriangle, XCircle, Info, X } from "lucide-react";

const Toast = ({ type, message, onClose }) => {
  const styles = {
    success: {
      bg: "bg-green-50",
      border: "border-green-500",
      icon: "text-green-500",
      text: "text-green-800",
      Icon: CheckCircle,
    },
    warning: {
      bg: "bg-yellow-50",
      border: "border-yellow-500",
      icon: "text-yellow-500",
      text: "text-yellow-800",
      Icon: AlertTriangle,
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-500",
      icon: "text-red-500",
      text: "text-red-800",
      Icon: XCircle,
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-500",
      icon: "text-blue-500",
      text: "text-blue-800",
      Icon: Info,
    },
  };

  const style = styles[type];
  const Icon = style.Icon;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slideInRight">
      <div
        className={`flex items-center gap-3 ${style.bg} border-l-4 ${style.border} rounded-lg shadow-lg p-4 min-w-[300px] max-w-md`}
      >
        <div className="flex-shrink-0">
          <Icon className={`w-5 h-5 ${style.icon}`} />
        </div>
        <div className="flex-1">
          <p className={`text-sm font-medium ${style.text}`}>{message}</p>
        </div>
        <button
          onClick={onClose}
          className={`flex-shrink-0 ${style.icon} hover:opacity-70 transition-opacity`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const useToast = () => {
  const showToast = useCallback((type, message, duration = 3000) => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    const removeToast = () => {
      root.unmount();
      document.body.removeChild(container);
    };

    root.render(<Toast type={type} message={message} onClose={removeToast} />);
    setTimeout(removeToast, duration);
  }, []);

  return {
    success: (message, duration) => showToast("success", message, duration),
    warning: (message, duration) => showToast("warning", message, duration),
    error: (message, duration) => showToast("error", message, duration),
    info: (message, duration) => showToast("info", message, duration), // ✅ Thêm phương thức info
  };
};

export default useToast;