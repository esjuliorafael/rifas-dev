import React, { useState, useRef } from 'react';
import { useTandas } from './TandaContext';
import { TandaParticipant } from '../types';
import { X, Share2, Download, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { addDays, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toJpeg } from 'html-to-image';
import { TandaReceipt } from './TandaReceipt';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  tandaId: string;
  participant: TandaParticipant;
  onClose: () => void;
}

export function TandaParticipantModal({ tandaId, participant, onClose }: Props) {
  const { updateParticipant, getTanda } = useTandas();
  const tanda = getTanda(tandaId);
  const receiptRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState(participant.name || '');
  const [phone, setPhone] = useState(participant.phone || '');
  const [viewState, setViewState] = useState<'details' | 'receipt'>('details');
  const [isExporting, setIsExporting] = useState(false);

  if (!tanda) return null;

  const handleReserve = (e: React.FormEvent) => {
    e.preventDefault();
    updateParticipant(tandaId, participant.id, {
      status: 'reserved',
      name,
      phone,
      reservedAt: new Date().toISOString()
    });
  };

  const handleTogglePayment = (weekIndex: number) => {
    const newPayments = [...participant.payments];
    if (newPayments[weekIndex]) {
      newPayments[weekIndex] = null; // Unmark
    } else {
      newPayments[weekIndex] = new Date().toISOString(); // Mark paid
    }
    updateParticipant(tandaId, participant.id, { payments: newPayments });
  };

  const handleCancelReservation = () => {
    if (confirm('¿Cancelar este participante? El lugar quedará disponible y perderás todo el historial de pagos.')) {
      updateParticipant(tandaId, participant.id, {
        status: 'available',
        name: '',
        phone: '',
        reservedAt: undefined,
        payments: Array(tanda.numberOfWeeks).fill(null)
      });
      onClose();
    }
  };

  const exportReceipt = async () => {
    if (!receiptRef.current) return;
    setIsExporting(true);
    try {
      await new Promise(res => setTimeout(res, 100)); // wait for render
      const dataUrl = await toJpeg(receiptRef.current, { quality: 0.95 });
      const link = document.createElement('a');
      link.download = `tanda-${participant.id}-${name.toLowerCase().replace(/\s+/g, '-')}.jpeg`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error(err);
      alert('Error generando comprobante');
    } finally {
      setIsExporting(false);
    }
  };

  const copyWhatsAppText = () => {
    const paidCount = participant.payments.filter(p => p !== null).length;
    let text = `*Tanda: ${tanda.name}*\nLugar: *#${participant.id}*\nParticipante: *${participant.name}*\n`;
    text += `Avance: *${paidCount} de ${tanda.numberOfWeeks} semanas pagadas*\n`;
    text += `Semanalidad: $${tanda.pricePerWeek}\n`;
    
    if (paidCount === tanda.numberOfWeeks) {
       text += `\n✅ ¡Tanda Completada!`;
    }
    navigator.clipboard.writeText(text);
    alert('Texto copiado para WhatsApp');
  };

  // Helper to calculate the date for a specific week based on start date
  const getWeekDate = (weekNum: number) => {
    if (!tanda.startDate) return null;
    const [y, m, d] = tanda.startDate.split('-');
    const date = new Date(Number(y), Number(m)-1, Number(d));
    const targetDate = addDays(date, (weekNum - 1) * 7);
    return targetDate;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 perspective-[1000px]">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div 
          initial={{ y: '100%', opacity: 1 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 1 }}
          transition={{ type: "spring", bounce: 0, duration: 0.4 }}
          className="bg-white shadow-2xl w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl flex flex-col relative z-10 max-h-[95vh] sm:max-h-[90vh]"
        >
          {/* Drag Handle for Mobile */}
          <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-4 mb-2 sm:hidden shrink-0" />
        
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
               <h3 className="font-bold text-gray-900 text-lg">
                  Lugar <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-black">#{participant.id}</span>
               </h3>
            </div>
            <button onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-gray-900 hover:bg-gray-200 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto pb-12 sm:pb-6">
            {viewState === 'details' ? (
              <div className="space-y-6">
                {participant.status === 'available' ? (
                  <form onSubmit={handleReserve} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre del participante</label>
                      <input 
                        type="text" required autoFocus
                        value={name} onChange={e => setName(e.target.value)}
                        placeholder="Ej: Ana Jiménez"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Teléfono o WhatsApp <span className="text-gray-400 font-normal">(Opcional)</span></label>
                      <input 
                        type="tel"
                        value={phone} onChange={e => setPhone(e.target.value)}
                        placeholder="Ej: 55 1234 5678"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                    <button 
                      type="submit" 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold mt-4 shadow-sm active:translate-y-[1px] transition-all"
                    >
                      Ocupar Lugar
                    </button>
                  </form>
                ) : (
                  <div className="space-y-6">
                     <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl flex justify-between items-center">
                       <div>
                         <p className="text-xs text-blue-800 font-semibold uppercase tracking-wider mb-0.5">Participante</p>
                         <p className="font-black text-gray-900 text-xl uppercase max-w-[200px] truncate">{participant.name}</p>
                       </div>
                       <button 
                           onClick={() => setViewState('receipt')}
                           className="flex flex-col items-center justify-center gap-1 bg-white hover:bg-gray-50 text-gray-700 p-2 px-3 rounded-xl shadow-sm border border-gray-200 font-semibold text-xs transition-colors shrink-0"
                       >
                         <Share2 size={16} />
                         Comprobante
                       </button>
                     </div>

                     <div className="space-y-2">
                       <h4 className="font-bold tracking-tight text-gray-900 mb-3">Historial de Pagos</h4>
                       
                       <div className="space-y-2">
                         {participant.payments.map((payment, idx) => {
                           const weekNum = idx + 1;
                           const isPaid = payment !== null;
                           const targetDate = getWeekDate(weekNum);
                           const dateStr = targetDate ? format(targetDate, "dd MMM", { locale: es }) : `Semana ${weekNum}`;
                           
                           return (
                             <button 
                               key={idx}
                               onClick={() => handleTogglePayment(idx)}
                               className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all active:scale-[0.98] ${
                                 isPaid ? 'border-emerald-500 bg-emerald-50/50' : 'border-gray-200 hover:border-gray-300 bg-white'
                               }`}
                             >
                               <div className="flex items-center gap-3">
                                 <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${isPaid ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                   {weekNum}
                                 </div>
                                 <div className="text-left font-semibold text-sm">
                                    <p className={isPaid ? 'text-emerald-900' : 'text-gray-900'}>Cobro {weekNum}</p>
                                    <p className={`text-xs ${isPaid ? 'text-emerald-600' : 'text-gray-500'}`}>
                                       {dateStr}
                                    </p>
                                 </div>
                               </div>
                               
                               <div className="flex items-center gap-2">
                                 <span className={`font-black ${isPaid ? 'text-emerald-700' : 'text-gray-900'}`}>${tanda.pricePerWeek}</span>
                                 {isPaid ? <CheckCircle2 className="text-emerald-500" size={24} /> : <Circle className="text-gray-300" size={24} />}
                               </div>
                             </button>
                           )
                         })}
                       </div>
                     </div>

                     <button 
                       onClick={handleCancelReservation}
                       className="w-full flex justify-center items-center gap-2 bg-white border-2 border-red-100 text-red-600 hover:border-red-200 hover:bg-red-50 py-3 px-4 rounded-xl font-bold transition-all mt-4"
                     >
                       <Trash2 size={18} />
                       Liberar Lugar
                     </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-2xl flex justify-center border border-gray-200 overflow-hidden">
                   <TandaReceipt 
                      ref={receiptRef} 
                      participant={participant} 
                      tanda={tanda} 
                   />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                   <button 
                     onClick={() => setViewState('details')}
                     className="flex justify-center items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 p-3 rounded-xl font-semibold transition-all"
                   >
                     Regresar
                   </button>
                   <button 
                     onClick={exportReceipt}
                     disabled={isExporting}
                     className="flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white p-3 rounded-xl font-semibold shadow-sm transition-all"
                   >
                     <Download size={18} />
                     {isExporting ? '...' : 'Descargar'}
                   </button>
                   <button 
                     onClick={copyWhatsAppText}
                     className="col-span-2 flex justify-center items-center gap-2 bg-green-500 hover:bg-green-600 text-white p-3 rounded-xl font-semibold shadow-sm transition-all text-center leading-tight whitespace-nowrap"
                   >
                     <Share2 size={18} />
                     Copiar resumen WhatsApp
                   </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
