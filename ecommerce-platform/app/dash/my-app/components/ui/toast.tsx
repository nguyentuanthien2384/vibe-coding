'use client';

import { useState, useCallback, createContext, useContext, useRef } from 'react';
import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────
type ToastType = 'success' | 'error' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  showToast: (type: ToastType, message: string) => void;
}

// ── Context ────────────────────────────────────────────────────
const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
};

// ── Toast Item ─────────────────────────────────────────────────
const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />,
  error: <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />,
  warning: <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />,
};

const STYLES: Record<ToastType, string> = {
  success: 'bg-white border-green-200 shadow-green-100',
  error: 'bg-white border-red-200 shadow-red-100',
  warning: 'bg-white border-amber-200 shadow-amber-100',
};

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

const ToastItem = ({ toast, onDismiss }: ToastItemProps) => (
  <div
    role="alert"
    className={`flex items-start gap-3 px-4 py-3.5 rounded-2xl border shadow-lg text-sm font-medium text-gray-700 animate-in slide-in-from-bottom-4 fade-in duration-300 max-w-sm ${STYLES[toast.type]}`}
  >
    {ICONS[toast.type]}
    <span className="flex-1 leading-snug">{toast.message}</span>
    <button
      onClick={() => onDismiss(toast.id)}
      className="p-0.5 text-gray-300 hover:text-gray-500 transition-colors rounded-md"
    >
      <X className="w-3.5 h-3.5" />
    </button>
  </div>
);

// ── Provider ───────────────────────────────────────────────────
interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const showToast = useCallback(
    (type: ToastType, message: string) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setToasts((prev) => [...prev, { id, type, message }]);

      // Auto-dismiss sau 4s (error sau 6s)
      const duration = type === 'error' ? 6000 : 4000;
      const timer = setTimeout(() => dismiss(id), duration);
      timers.current.set(id, timer);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Container — fixed bottom-right */}
      <div
        aria-live="polite"
        aria-label="Thông báo"
        className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2.5 pointer-events-none"
      >
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
