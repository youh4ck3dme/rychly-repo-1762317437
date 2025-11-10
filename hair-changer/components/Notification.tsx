import React, { useEffect, useState, useCallback } from "react";
import {
  Notification as NotificationDetails,
  NotificationType,
} from "../context/NotificationContext";
import { useNotification } from "../hooks/useNotification";

const InfoIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);
const SuccessIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);
const WarningIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
    />
  </svg>
);
const ErrorIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);
const CloseIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const notificationConfig: Record<
  NotificationType,
  { icon: React.ReactElement; base: string; iconColor: string }
> = {
  info: {
    icon: <InfoIcon />,
    base: "border-blue-500",
    iconColor: "text-blue-500",
  },
  success: {
    icon: <SuccessIcon />,
    base: "border-green-500",
    iconColor: "text-green-500",
  },
  warning: {
    icon: <WarningIcon />,
    base: "border-yellow-500",
    iconColor: "text-yellow-500",
  },
  error: {
    icon: <ErrorIcon />,
    base: "border-red-500",
    iconColor: "text-red-500",
  },
};

interface NotificationProps {
  notification: NotificationDetails;
}

export const Notification: React.FC<NotificationProps> = ({ notification }) => {
  const { removeNotification } = useNotification();
  const [isExiting, setIsExiting] = useState(false);
  const { type, title, message, id, duration } = notification;
  const config = notificationConfig[type];

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => removeNotification(id), 300); // Animation duration
  }, [id, removeNotification]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration || 5000);

    return () => clearTimeout(timer);
  }, [duration, handleClose]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`
                glass-panel w-full max-w-sm pointer-events-auto border-l-4
                transition-all duration-300 ease-in-out transform
                ${config.base}
                ${isExiting ? "opacity-0 scale-95" : "opacity-100 scale-100"}
            `}
      style={{ animation: "slideInFromRight 0.4s ease-out forwards" }}
    >
      <div className="p-4 flex items-start">
        <div className={`flex-shrink-0 ${config.iconColor}`}>{config.icon}</div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-bold text-black dark:text-white">
            {title}
          </p>
          <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
            {message}
          </p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            onClick={handleClose}
            className="inline-flex rounded-md text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
            aria-label="Close notification"
          >
            <CloseIcon />
          </button>
        </div>
      </div>
    </div>
  );
};
