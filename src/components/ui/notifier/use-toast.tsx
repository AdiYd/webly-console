import React, { useEffect, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Icon } from '@iconify/react/dist/iconify.js';

export type ToastSeverity = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  open: boolean;
  message: string;
  severity?: ToastSeverity;
  duration?: number;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  open,
  message,
  severity = 'info',
  duration = 4000,
  onClose,
}) => {
  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [open, duration, onClose]);

  const getSeverityStyles = () => {
    const baseStyles = 'border-l-4';
    switch (severity) {
      case 'success':
        return `${baseStyles} border-green-500 bg-gradient-to-l from-success/80 to-success/60 backdrop-blur-lg text-success-800`;
      case 'error':
        return `${baseStyles} border-red-500 bg-gradient-to-l from-error/80 to-error/60 backdrop-blur-lg text-error-800`;
      case 'warning':
        return `${baseStyles} border-yellow-500 bg-gradient-to-l from-warning/80 to-warning/60 backdrop-blur-lg text-warning-800`;
      case 'info':
      default:
        return `${baseStyles} border-blue-500 bg-gradient-to-l from-info/80 to-info/60 backdrop-blur-lg text-info-800`;
    }
  };

  const getSeverityIcon = () => {
    switch (severity) {
      case 'success':
        return <Icon icon="ci:check-all" className="text-lg font-bold" />;
      case 'error':
        return <Icon icon="mdi:close" className="text-lg font-bold" />;
      case 'warning':
        return <Icon icon="mdi:alert" className="text-lg font-bold" />;
      case 'info':
      default:
        return <Icon icon="mdi:information" className="text-lg font-bold" />;
    }
  };

  return (
    <AnimatePresence mode="popLayout">
      {open && (
        <motion.div
          initial={{ opacity: 0.4, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0.4, y: 50 }}
          className="fixed top-12 left-8  z-[9999]"
        >
          <div
            className={`
              ${getSeverityStyles()}
              min-w-80 max-w-md p-4 rounded-lg shadow-lg flex items-center gap-3
            `}
          >
            <span className="text-lg font-semibold">{getSeverityIcon()}</span>
            <span className="flex-1 text-base font-medium">{message}</span>
            <button
              onClick={() => onClose()}
              className="text-current opacity-70 hover:opacity-100 transition-opacity duration-200 text-lg font-bold"
            >
              <Icon icon="mdi:close" className="text-lg font-bold hover:text-black" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Hook for easier usage
export const useToast = () => {
  const [toastState, setToastState] = useState<{
    open: boolean;
    message: string;
    severity: ToastSeverity;
    duration: number;
  }>({
    open: false,
    message: '',
    severity: 'info',
    duration: 4000,
  });

  // stabilize functions with useCallback so their identity doesn't change every render
  const showToast = useCallback(
    (message: string, severity: ToastSeverity = 'info', duration: number = 4000) => {
      setToastState({
        open: true,
        message,
        severity,
        duration,
      });
    },
    []
  );

  const hideToast = useCallback(() => {
    setToastState(prev => ({ ...prev, open: false }));
  }, []);

  // Return the rendered element and stable callbacks
  return {
    toast: <Toast {...toastState} onClose={hideToast} />,
    showToast,
    hideToast,
    onClose: hideToast,
  };
};
