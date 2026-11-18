import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  LogOut,
  X 
} from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const toastRef = useRef(null);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, options = {}) => {
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const type = options.type || 'info';
    // Default to 3 seconds (3000ms) as requested
    const duration = options.duration !== undefined ? options.duration : 3000;
    const title = options.title || (
      type === 'success' ? 'Success' :
      type === 'logout' ? 'Logged Out' :
      type === 'error' ? 'Notice' :
      type === 'warning' ? 'Attention Required' : 'Information'
    );

    const newToast = {
      id,
      message,
      title,
      type,
      duration,
      createdAt: Date.now()
    };

    setToasts((prev) => [...prev.slice(-4), newToast]); // keep up to 5 toasts
    return id;
  }, []);

  const toast = useCallback((msg, opts) => addToast(msg, opts), [addToast]);
  toast.success = useCallback((msg, opts) => addToast(msg, { ...opts, type: 'success' }), [addToast]);
  toast.error = useCallback((msg, opts) => addToast(msg, { ...opts, type: 'error' }), [addToast]);
  toast.logout = useCallback((msg, opts) => addToast(msg, { ...opts, type: 'logout', title: opts?.title || 'Session Terminated' }), [addToast]);
  toast.warning = useCallback((msg, opts) => addToast(msg, { ...opts, type: 'warning' }), [addToast]);
  toast.info = useCallback((msg, opts) => addToast(msg, { ...opts, type: 'info' }), [addToast]);

  toastRef.current = toast;

  // Intercept native browser alert() so any alert() across the entire app
  // renders our modern styled UI toast instead of the ugly browser modal
  useEffect(() => {
    const originalAlert = window.alert;
    window.alert = (msg) => {
      const displayMsg = typeof msg === 'object' ? JSON.stringify(msg) : String(msg);
      toastRef.current.warning(displayMsg, {
        title: 'Attention Required'
      });
    };

    return () => {
      window.alert = originalAlert;
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.toast;
}

function ToastContainer({ toasts, onRemove }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <aside 
      aria-live="polite"
      aria-atomic="false"
      className="fixed top-5 right-5 z-[999999] flex flex-col items-end gap-2 max-w-[94vw] pointer-events-none"
    >
      {toasts.map((item) => (
        <ToastItem key={item.id} toast={item} onRemove={() => onRemove(item.id)} />
      ))}
    </aside>
  );
}

function ToastItem({ toast, onRemove }) {
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!toast.duration || toast.duration <= 0) return;

    const intervalTime = 30;
    const step = (intervalTime / toast.duration) * 100;

    const timer = setInterval(() => {
      if (!isPaused) {
        setProgress((prev) => {
          if (prev <= step) {
            clearInterval(timer);
            onRemove();
            return 0;
          }
          return prev - step;
        });
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [toast.duration, isPaused, onRemove]);

  const configs = {
    success: {
      cardClass: 'bg-[#f0fdf4] border border-[#22c55e] text-[#15803d] shadow-sm',
      iconClass: 'text-[#16a34a]',
      progressBar: 'bg-[#16a34a]',
      msgClass: 'text-[#15803d] font-medium',
      Icon: CheckCircle2,
    },
    logout: {
      cardClass: 'bg-[#fef2f2] border border-[#ef4444] text-[#b91c1c] shadow-sm',
      iconClass: 'text-[#dc2626]',
      progressBar: 'bg-[#dc2626]',
      msgClass: 'text-[#b91c1c] font-medium',
      Icon: LogOut,
    },
    error: {
      cardClass: 'bg-[#fef2f2] border border-[#ef4444] text-[#b91c1c] shadow-sm',
      iconClass: 'text-[#dc2626]',
      progressBar: 'bg-[#dc2626]',
      msgClass: 'text-[#b91c1c] font-medium',
      Icon: AlertCircle,
    },
    warning: {
      cardClass: 'bg-[#fffbeb] border border-[#f59e0b] text-[#b45309] shadow-sm',
      iconClass: 'text-[#d97706]',
      progressBar: 'bg-[#d97706]',
      msgClass: 'text-[#b45309] font-medium',
      Icon: AlertTriangle,
    },
    info: {
      cardClass: 'bg-[#f0f9ff] border border-[#0ea5e9] text-[#0369a1] shadow-sm',
      iconClass: 'text-[#0284c7]',
      progressBar: 'bg-[#0284c7]',
      msgClass: 'text-[#0369a1] font-medium',
      Icon: Info,
    },
  };

  const current = configs[toast.type] || configs.info;
  const { Icon } = current;

  return (
    <div
      role="status"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`pointer-events-auto relative overflow-hidden rounded-lg border px-3.5 py-2 transition-all duration-200 transform translate-y-0 opacity-100 ${current.cardClass}`}
      style={{
        animation: 'toastSlideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards'
      }}
    >
      <style>{`
        @keyframes toastSlideIn {
          from { transform: translateX(110%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
      <div className="flex items-center gap-2.5">
        <Icon className={`w-4 h-4 shrink-0 ${current.iconClass}`} />

        <span className={`text-xs sm:text-sm whitespace-nowrap leading-none tracking-normal font-sans ${current.msgClass}`}>
          {toast.message}
        </span>

        <button
          type="button"
          onClick={onRemove}
          title="Dismiss"
          className="shrink-0 ml-1.5 p-0.5 rounded text-current opacity-60 hover:opacity-100 hover:bg-black/5 transition-opacity"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Progress Bar Timer */}
      {toast.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black/5 overflow-hidden">
          <div
            className={`h-full transition-all duration-75 linear ${current.progressBar}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
