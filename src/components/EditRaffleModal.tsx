import React, { useState, useEffect } from 'react';
import { Edit, X } from 'lucide-react';
import { Raffle } from '../types';
import { useRaffles } from './RaffleContext';
import { motion, AnimatePresence } from 'motion/react';

export function EditRaffleModal({ raffle, onClose }: { raffle: Raffle, onClose: () => void }) {
  const { updateRaffle } = useRaffles();
  const [name, setName] = useState(raffle.name);
  const [description, setDescription] = useState(raffle.description || '');
  const [pricePerTicket, setPricePerTicket] = useState(raffle.pricePerTicket);
  const [themeColor, setThemeColor] = useState(raffle.themeColor || '');

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateRaffle(raffle.id, {
      name,
      description,
      pricePerTicket,
      themeColor: themeColor ? themeColor : undefined,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        {/* Contenedor del modal */}
        <motion.div
          initial={{ y: '100%', opacity: 1 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 1 }}
          transition={{ type: "spring", bounce: 0, duration: 0.4 }}
          className="bg-white shadow-2xl w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl flex flex-col relative z-10 max-h-[95vh] sm:max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drag handle mobile */}
          <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-4 mb-2 sm:hidden shrink-0" />

          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Edit className="text-emerald-500" size={24} />
              <h2 className="text-xl font-bold text-gray-900">Editar Rifa</h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
              <X size={20} />
            </button>
          </div>

          <div className="overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción (Opcional)</label>
                <textarea 
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Precio por boleto</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                  <input 
                    type="number" 
                    min="1"
                    required
                    value={pricePerTicket}
                    onChange={e => setPricePerTicket(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Color de Tema (Opcional)</label>
                <div className="flex gap-2">
                  <input 
                    type="color" 
                    value={themeColor || '#10b981'}
                    onChange={e => setThemeColor(e.target.value)}
                    className="h-10 w-16 p-1 border border-gray-300 rounded-lg cursor-pointer flex-shrink-0"
                  />
                  <input 
                    type="text" 
                    value={themeColor}
                    onChange={e => setThemeColor(e.target.value)}
                    placeholder="#HEXCODE"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none uppercase font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setThemeColor('')}
                    className="px-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 font-medium text-sm flex-shrink-0"
                  >
                    Limpiar
                  </button>
                </div>
              </div>

              <div className="pt-4 flex gap-3 justify-end border-t border-gray-100 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 font-semibold text-white bg-gray-900 hover:bg-gray-800 rounded-xl transition-colors shadow-sm"
                >
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
