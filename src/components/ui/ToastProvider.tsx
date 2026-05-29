import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  toast: (title: string, message?: string, type?: ToastType) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((title: string, message?: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => removeToast(id), 5000);
  }, [removeToast]);

  const success = useCallback((title: string, message?: string) => toast(title, message, 'success'), [toast]);
  const error = useCallback((title: string, message?: string) => toast(title, message, 'error'), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div 
            key={t.id} 
            className={`flex items-start gap-3 p-4 rounded-xl shadow-lg border w-80 transform transition-all animate-appearance-in
              ${t.type === 'success' ? 'bg-success-50 border-success-200 text-success-800' : 
                t.type === 'error' ? 'bg-danger-50 border-danger-200 text-danger-800' : 
                'bg-blue-50 border-blue-200 text-blue-800'}
            `}
          >
            {t.type === 'success' && <CheckCircle size={24} className="text-success mt-0.5" />}
            {t.type === 'error' && <AlertCircle size={24} className="text-danger mt-0.5" />}
            {t.type === 'info' && <Info size={24} className="text-blue-500 mt-0.5" />}
            <div className="flex-1">
              <h4 className="font-semibold">{t.title}</h4>
              {t.message && <p className="text-sm opacity-80 mt-1">{t.message}</p>}
            </div>
            <button onClick={() => removeToast(t.id)} className="text-current opacity-50 hover:opacity-100">
              <X size={18} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
