import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface DialogProps {
  open: boolean;
  title?: string;
  children: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onClose: () => void;
  hideCancel?: boolean;
  hideConfirm?: boolean;
  // optional: animation duration to match CSS (ms)
  animationDurationMs?: number;
}

export const Dialog: React.FC<DialogProps> = ({
  open,
  title,
  children,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onClose,
  hideCancel = false,
  hideConfirm = false,
  animationDurationMs = 200,
}) => {
  // Mounted controls whether portal is attached.
  const [mounted, setMounted] = useState<boolean>(open);
  // Visibility controls CSS classes for enter/exit animations.
  const [isVisible, setIsVisible] = useState<boolean>(open);

  // When `open` becomes true, ensure mounted and show
  useEffect(() => {
    if (open) {
      setMounted(true);
      // small tick to allow mounting before adding visible class (helps CSS transitions)
      // but we can set true immediately too
      requestAnimationFrame(() => setIsVisible(true));
      // lock body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // start exit animation
      setIsVisible(false);
      // after animation end, unmount and restore body scroll
      const t = window.setTimeout(() => {
        setMounted(false);
        document.body.style.overflow = 'unset';
      }, animationDurationMs + 50);
      return () => window.clearTimeout(t);
    }
    // cleanup when component unmounts
    return () => {
      // restore overflow in rare unmount scenarios
      document.body.style.overflow = 'unset';
    };
  }, [open, animationDurationMs]);

  const handleClose = () => {
    // start exit animation and call parent's onClose after delay
    setIsVisible(false);
    // call onClose after same animation duration so parent can update state
    setTimeout(() => {
      onClose();
    }, animationDurationMs);
  };

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    handleClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // If not mounted, don't render anything (avoids SSR/document access)
  if (!mounted) return null;

  // Dialog markup (centered). We'll portal this into document.body so it's independent
  const dialogMarkup = (
    <div
      className={`
        fixed inset-0 z-[100] flex items-center justify-center p-4
        transition-all duration-[${animationDurationMs}ms] ease-in-out
        ${isVisible ? 'opacity-100' : 'opacity-0'}
      `}
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-80" />
      {/* Dialog */}
      <div
        className={`
          relative glass* bg-base-100 border-[1px] border-zinc-400/40 rounded-lg shadow-xl max-w-xl w-full max-h-[90vh] overflow-hidden
          transition-all duration-[${animationDurationMs}ms] ease-in-out
          ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}
        `}
      >
        {title && (
          <div className="px-4 py-4 border-b-[1px] border-zinc-400/40 flex items-center justify-between">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200 text-xl font-bold"
              aria-label="Close dialog"
            >
              ×
            </button>
          </div>
        )}

        <div className="px-4 py-4 overflow-y-auto">{children}</div>

        {(!hideCancel || !hideConfirm) && (
          <div className="px-4 py-4 border-t-[1px] border-zinc-400/40 flex gap-3 justify-end">
            {!hideCancel && (
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
              >
                {cancelText}
              </button>
            )}
            {!hideConfirm && (
              <button
                onClick={handleConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-secondary hover:bg-accent rounded-md transition-colors duration-200"
              >
                {confirmText}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // Use createPortal to render to document.body
  return typeof document !== 'undefined' ? createPortal(dialogMarkup, document.body) : null;
};

// Hook unchanged (keep your useDialog implementation below)
export const useDialog = () => {
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    title?: string;
    content?: React.ReactNode;
  }>({
    open: false,
    title: '',
    content: null,
  });

  const showDialog = (title?: string, content?: React.ReactNode) => {
    setDialogState({
      open: true,
      title,
      content,
    });
  };

  const hideDialog = () => {
    setDialogState(prev => ({ ...prev, open: false }));
  };

  return {
    ...dialogState,
    showDialog,
    hideDialog,
    onClose: hideDialog,
  };
};
