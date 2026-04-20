import { AnimatePresence, motion } from 'motion/react';
import { useToastListener } from '../hooks/useToast';
import { CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';

const icons = {
  success: <CheckCircle2 size={18} className="text-emerald-500" />,
  warning: <AlertTriangle size={18} className="text-amber-500" />,
  error:   <XCircle size={18} className="text-red-500" />,
  info:    <Info size={18} className="text-blue-500" />,
};

const borders = {
  success: 'border-l-emerald-500',
  warning: 'border-l-amber-400',
  error:   'border-l-red-500',
  info:    'border-l-blue-500',
};

export function ToastContainer() {
  const toasts = useToastListener();

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 items-center w-full max-w-sm px-4 pointer-events-none">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ type: 'spring', bounce: 0.25, duration: 0.35 }}
            className={`
              w-full flex items-center gap-3 bg-white border border-gray-200
              border-l-4 ${borders[t.type]} rounded-2xl px-4 py-3.5
              shadow-lg shadow-black/10 pointer-events-auto
            `}
          >
            {icons[t.type]}
            <span className="text-sm font-semibold text-gray-800 flex-1">{t.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
