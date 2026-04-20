import { useEffect, useState } from 'react';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface ToastPayload {
  id: string;
  message: string;
  type: ToastType;
}

// Función para disparar un toast desde cualquier parte del árbol
export function toast(message: string, type: ToastType = 'success') {
  window.dispatchEvent(new CustomEvent('app:toast', {
    detail: { id: crypto.randomUUID(), message, type }
  }));
}

// Hook para escuchar y renderizar toasts
export function useToastListener() {
  const [toasts, setToasts] = useState<ToastPayload[]>([]);

  useEffect(() => {
    const handler = (e: Event) => {
      const payload = (e as CustomEvent<ToastPayload>).detail;
      setToasts(prev => [...prev, payload]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== payload.id));
      }, 3000);
    };
    window.addEventListener('app:toast', handler);
    return () => window.removeEventListener('app:toast', handler);
  }, []);

  return toasts;
}
