import { useEffect } from 'react';

interface ToastProps {
  kind: 'success' | 'error';
  message: string;
  onClose: () => void;
}

export function Toast({ kind, message, onClose }: ToastProps) {
  useEffect(() => {
    const timer = window.setTimeout(onClose, 3500);
    return () => window.clearTimeout(timer);
  }, [onClose]);

  const palette =
    kind === 'success'
      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
      : 'bg-red-50 border-red-300 text-red-800';

  return (
    <div className={`fixed right-4 top-4 z-[70] max-w-sm rounded-xl border px-4 py-3 shadow-lg ${palette}`}>
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}
