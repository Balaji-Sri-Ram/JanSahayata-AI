import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
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
    const duration = options.duration !== undefined ? options.duration : (type === 'error' ? 5000 : 4200);
    const title = options.title || (
      type === 'success' ? 'Success' :
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
      className="fixed top-3 right-3 sm:top-4 sm:right-4 z-[999999] flex flex-col gap-2 max-w-[94vw] sm:max-w-[340px] w-full pointer-events-none"
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
    warning: {
      cardClass: 'bg-amber-50/95 border-amber-300 text-amber-950 shadow-amber-500/10',
      iconBg: 'bg-amber-100 text-amber-700 border border-amber-200',
      progressBar: 'bg-amber-500',
      Icon: AlertTriangle,
    },
    error: {
      cardClass: 'bg-rose-50/95 border-rose-300 text-rose-950 shadow-rose-500/10',
      iconBg: 'bg-rose-100 text-rose-700 border border-rose-200',
      progressBar: 'bg-rose-600',
      Icon: AlertCircle,
    },
    success: {
      cardClass: 'bg-emerald-50/95 border-emerald-300 text-emerald-950 shadow-emerald-500/10',
      iconBg: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
      progressBar: 'bg-emerald-600',
      Icon: CheckCircle2,
    },
    info: {
      cardClass: 'bg-slate-50/95 border-blue-200 text-slate-900 shadow-blue-500/10',
      iconBg: 'bg-blue-100 text-[#0b2545] border border-blue-200',
      progressBar: 'bg-[#0b2545]',
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
      className={`pointer-events-auto relative overflow-hidden rounded-lg border backdrop-blur-md shadow-xl px-3 py-2.5 transition-all duration-200 transform translate-y-0 opacity-100 hover:scale-[1.01] ${current.cardClass}`}
      style={{
        animation: 'toastSlideIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards'
      }}
    >
      <div className="flex items-start gap-2.5">
        <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${current.iconBg}`}>
          <Icon className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0 pr-1">
          {toast.title && (
            <div className="text-[10px] font-bold tracking-wider uppercase opacity-80 leading-none mb-1">
              {toast.title}
            </div>
          )}
          <div className="text-xs font-medium leading-snug break-words">
            {toast.message}
          </div>
        </div>

        <button
          type="button"
          onClick={onRemove}
          title="Dismiss"
          className="shrink-0 p-0.5 rounded text-slate-400 hover:text-slate-700 hover:bg-black/5 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Progress Bar Timer */}
      {toast.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-black/5 overflow-hidden">
          <div
            className={`h-full transition-all duration-75 linear ${current.progressBar}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
