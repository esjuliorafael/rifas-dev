import React, { useState, useRef } from 'react';
import { useRaffles } from './RaffleContext';
import { Ticket } from '../types';
import { X, Check, Share2, Download, Trash2, ArrowLeft } from 'lucide-react';
import { TicketReceipt } from './TicketReceipt';
import { TicketReceiptMulti } from './TicketReceiptMulti';
import { toJpeg } from 'html-to-image';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  raffleId: string;
  ticket?: Ticket;
  tickets?: Ticket[];
  onClose: () => void;
}

export function TicketModal({ raffleId, ticket, tickets, onClose }: Props) {
  const { updateTicket, getRaffle } = useRaffles();
  const raffle = getRaffle(raffleId);
  const receiptRef = useRef<HTMLDivElement>(null);

  const targetTickets = tickets && tickets.length > 0 ? tickets : (ticket ? [ticket] : []);
  const baseTicket = targetTickets[0];

  const [name, setName] = useState(baseTicket?.ownerName || '');
  const [phone, setPhone] = useState(baseTicket?.ownerPhone || '');
  const [viewState, setViewState] = useState<'details' | 'receipt'>('details');
  const [receiptMode, setReceiptMode] = useState<'reserved' | 'paid'>('reserved');
  const [isExporting, setIsExporting] = useState(false);
  const [pendingPayTickets, setPendingPayTickets] = useState<Ticket[]>([]);
  const [showPayConfirm, setShowPayConfirm] = useState(false);
  const [actuallyPaidTickets, setActuallyPaidTickets] = useState<Ticket[] | null>(null);

  const displayTickets = actuallyPaidTickets || targetTickets;
  const isMulti = targetTickets.length > 1;
  const isDisplayMulti = displayTickets.length > 1;
  const displayBase = displayTickets[0];

  if (!raffle || targetTickets.length === 0) return null;

  const handleReserve = (e: React.FormEvent) => {
    e.preventDefault();
    const reservedAt = new Date().toISOString();
    targetTickets.forEach(t => {
      updateTicket(raffleId, t.id, {
        status: 'reserved',
        ownerName: name,
        ownerPhone: phone,
        reservedAt
      });
    });
    setReceiptMode('reserved');
    setViewState('receipt');
  };

  const handlePay = () => {
    const ownerName = baseTicket.ownerName;
    if (!ownerName) {
      executePay(targetTickets.map(t => t.id));
      return;
    }

    const allTickets = Object.values(raffle.tickets) as Ticket[];
    const targetIds = new Set(targetTickets.map(t => t.id));
    
    const sameClientTickets = allTickets.filter(t => 
      t.ownerName === ownerName &&
      t.status === 'reserved' &&
      !targetIds.has(t.id)
    );

    if (sameClientTickets.length > 0) {
      setPendingPayTickets(sameClientTickets);
      setShowPayConfirm(true);
    } else {
      executePay(targetTickets.map(t => t.id));
    }
  };

  const executePay = (ids: string[]) => {
    const paidAt = new Date().toISOString();
    ids.forEach(id => {
      updateTicket(raffleId, id, {
        status: 'paid',
        paidAt
      });
    });

    const allTickets = Object.values(raffle.tickets) as Ticket[];
    const paidObjs = allTickets.filter(t => ids.includes(t.id)).map(t => ({...t, status: 'paid' as const, paidAt}));
    setActuallyPaidTickets(paidObjs);

    setReceiptMode('paid');
    setViewState('receipt');
    setShowPayConfirm(false);
  };

  const handleCancelReservation = () => {
    if (confirm(isMulti ? '¿Cancelar todos los apartados?' : '¿Cancelar el apartado? El boleto quedará disponible.')) {
      targetTickets.forEach(t => {
        updateTicket(raffleId, t.id, {
          status: 'available',
          ownerName: '',
          ownerPhone: '',
          reservedAt: undefined,
          paidAt: undefined
        });
      });
      onClose();
    }
  };
  
  const handleCancelPayment = () => {
    if (confirm('¿Cambiar de Pagado a Apartado?')) {
      targetTickets.forEach(t => {
        updateTicket(raffleId, t.id, {
          status: 'reserved',
          paidAt: undefined
        });
      });
    }
  };

  const exportReceipt = async () => {
    if (!receiptRef.current) return;
    setIsExporting(true);
    try {
      await new Promise(res => setTimeout(res, 100)); // wait for render
      const dataUrl = await toJpeg(receiptRef.current, { 
        quality: 0.95,
        pixelRatio: 3 
      });
      const link = document.createElement('a');
      const filenameId = isDisplayMulti ? 'MULTI' : displayBase.id;
      link.download = `ticket-${filenameId}-${receiptMode}.jpeg`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error(err);
      alert('Error generando ticket');
    } finally {
      setIsExporting(false);
    }
  };

  const copyWhatsAppText = () => {
    let text = `*Rifa: ${raffle.name}*\n`;
    if (isDisplayMulti) {
      text += `Boletos: *${displayTickets.map(t => t.id).join(', ')}*\n`;
    } else {
      text += `Boleto: *${displayBase.id}*\n`;
      if (displayBase.numbers.length > 1) {
         text += `Oportunidades extra: ${displayBase.numbers.slice(1).join(', ')}\n`;
      }
    }
    text += `Estado: *${receiptMode === 'paid' ? 'PAGADO ✅' : 'APARTADO ⏳'}*\n`;
    text += `Costo: $${raffle.pricePerTicket * displayTickets.length}\n`;
    text += `Nombre: ${displayBase.ownerName || name}`;
    navigator.clipboard.writeText(text);
    alert('Texto copiado para WhatsApp');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 perspective-[1000px]">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div 
          initial={{ y: '100%', opacity: 1 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 1 }}
          transition={{ type: "spring", bounce: 0, duration: 0.4 }}
          className="bg-white shadow-2xl w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl flex flex-col relative z-10 max-h-[95vh] sm:max-h-[90vh]"
        >
          {/* Drag Handle for Mobile */}
          <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-4 mb-2 sm:hidden shrink-0" />
        
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
             {viewState === 'receipt' && (
               <button onClick={() => setViewState('details')} className="p-2 -ml-2 rounded-full hover:bg-gray-200">
                 <ArrowLeft size={20} />
               </button>
             )}
             <h3 className="font-bold text-gray-900 text-lg">
                {isMulti ? (
                   `Apartar ${targetTickets.length} boletos`
                ) : (
                   <>Boleto <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-black">{baseTicket.id}</span></>
                )}
             </h3>
          </div>
          <button onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-gray-900 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto pb-12 sm:pb-6">
          {viewState === 'details' ? (
            showPayConfirm ? (
              <div className="space-y-6">
                 <div className="text-center">
                   <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                     <Check size={32} strokeWidth={3} />
                   </div>
                   <h3 className="text-xl font-bold text-gray-900 mb-2">Otros boletos apartados</h3>
                   <p className="text-gray-500 text-sm">
                     El participante <strong>{baseTicket.ownerName}</strong> tiene otros boletos apartados pendientes de pago.
                   </p>
                 </div>
                 
                 <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 shadow-inner">
                   <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-3">Boletos pendientes extras</p>
                   <div className="flex flex-wrap gap-2">
                     {pendingPayTickets.map(t => (
                       <div key={t.id} className="bg-white border border-gray-200 px-3 py-1.5 rounded-lg font-bold text-gray-800 shadow-sm flex items-center gap-1">
                         <span>{t.id}</span>
                         {t.numbers.length > 1 && <span className="text-[10px] text-gray-400">{t.numbers.slice(1).join(' ')}</span>}
                       </div>
                     ))}
                   </div>
                   <div className="flex justify-between items-end mt-4 pt-4 border-t border-gray-200">
                      <span className="text-sm font-semibold text-gray-600">Total extra a pagar:</span>
                      <span className="text-lg font-black text-emerald-600">${raffle.pricePerTicket * pendingPayTickets.length}</span>
                   </div>
                 </div>

                 <div className="flex flex-col gap-3">
                   <button 
                     onClick={() => executePay([...targetTickets.map(t => t.id), ...pendingPayTickets.map(t => t.id)])}
                     className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-xl font-bold shadow-sm active:translate-y-[1px] transition-all"
                   >
                     Pagar Todos los {targetTickets.length + pendingPayTickets.length} Boletos
                   </button>
                   <button 
                     onClick={() => executePay(targetTickets.map(t => t.id))}
                     className="w-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 py-3 px-4 rounded-xl font-bold shadow-sm transition-all"
                   >
                     Pagar Solo {isMulti ? 'los Seleccionados' : 'el Seleccionado'}
                   </button>
                   <button
                     onClick={() => setShowPayConfirm(false)}
                     className="w-full text-gray-500 hover:text-gray-700 text-sm font-bold py-2 mt-2 transition-all"
                   >
                     Cancelar
                   </button>
                 </div>
              </div>
            ) : (
            <div className="space-y-6">
              {/* Status Badge */}
              {!isMulti && (
                <div className="flex justify-center">
                   {baseTicket.status === 'available' && <span className="inline-block bg-gray-100 text-gray-600 px-4 py-1.5 rounded-full font-bold text-sm">Disponible</span>}
                   {baseTicket.status === 'reserved' && <span className="inline-block bg-amber-100 text-amber-800 px-4 py-1.5 rounded-full font-bold text-sm">Apartado</span>}
                   {baseTicket.status === 'paid' && <span className="inline-block bg-emerald-100 text-emerald-800 px-4 py-1.5 rounded-full font-bold text-sm">Pagado</span>}
                </div>
              )}

              {/* Multi-Chips view */}
              {isMulti ? (
                <div className="flex flex-wrap gap-2 justify-center mb-6">
                  {targetTickets.map(t => (
                    <div key={t.id} className="bg-gray-100 px-3 py-1 rounded-xl border border-gray-200 font-black text-gray-900 flex flex-col items-center">
                      <span>{t.id}</span>
                      {t.numbers.length > 1 && <span className="text-[10px] text-gray-500">{t.numbers.slice(1).join(' ')}</span>}
                    </div>
                  ))}
                </div>
              ) : (
                baseTicket.numbers.length > 1 && (
                   <div className="bg-gray-100 px-4 py-3 rounded-xl border border-gray-200 shadow-sm text-center">
                     <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">Números de este boleto</p>
                     <div className="flex flex-wrap gap-1.5 justify-center">
                        {baseTicket.numbers.map((n, i) => (
                           <span key={n} className={`${i === 0 ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'} border border-gray-200 px-2 py-1 rounded font-bold text-sm shadow-sm`}>{n}</span>
                        ))}
                     </div>
                   </div>
                )
              )}

              {targetTickets.every(t => t.status === 'available') ? (
                <form onSubmit={handleReserve} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre del comprador</label>
                    <input 
                      type="text" required autoFocus
                      value={name} onChange={e => setName(e.target.value)}
                      placeholder="Ej: Juan Pérez"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Teléfono o WhatsApp <span className="text-gray-400 font-normal">(Opcional)</span></label>
                    <input 
                      type="tel"
                      value={phone} onChange={e => setPhone(e.target.value)}
                      placeholder="Ej: 55 1234 5678"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold mt-4 shadow-sm active:translate-y-[1px] transition-all"
                  >
                    Apartar {isMulti ? `${targetTickets.length} Boletos` : 'Boleto'}
                  </button>
                </form>
              ) : (
                <div className="space-y-6">
                   <div className="bg-gray-50 border border-gray-200 p-4 rounded-2xl space-y-3">
                     <div>
                       <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-0.5">Nombre</p>
                       <p className="font-bold text-gray-900 text-lg">{baseTicket.ownerName || name}</p>
                     </div>
                     {(baseTicket.ownerPhone || phone) && (
                       <div>
                         <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-0.5">Teléfono</p>
                         <p className="font-medium text-gray-900">{baseTicket.ownerPhone || phone}</p>
                       </div>
                     )}
                     <div>
                       <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-0.5">Fecha Apartado</p>
                       <p className="font-medium text-gray-900">
                         {baseTicket.reservedAt ? format(new Date(baseTicket.reservedAt), "dd MMM yyyy, p", { locale: es }) : 'N/A'}
                       </p>
                     </div>
                     {baseTicket.paidAt && (
                       <div>
                         <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-0.5">Fecha Pago</p>
                         <p className="font-medium text-gray-900">
                           {format(new Date(baseTicket.paidAt), "dd MMM yyyy, p", { locale: es })}
                         </p>
                       </div>
                     )}
                   </div>

                   {/* Action Buttons */}
                   <div className="flex flex-col gap-3">
                     {targetTickets.every(t => t.status === 'reserved') && (
                       <>
                         <button 
                           onClick={handlePay}
                           className="w-full flex justify-center items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-xl font-bold shadow-sm active:translate-y-[1px] transition-all"
                         >
                           <Check size={20} />
                           Registrar Pago
                         </button>
                         <button 
                           onClick={() => {
                             setReceiptMode('reserved');
                             setViewState('receipt');
                           }}
                           className="w-full flex justify-center items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white py-3 px-4 rounded-xl font-bold shadow-sm active:translate-y-[1px] transition-all"
                         >
                           <Share2 size={20} />
                           Generar Ticket de Apartado
                         </button>
                         <button 
                           onClick={handleCancelReservation}
                           className="w-full flex justify-center items-center gap-2 bg-white border-2 border-red-100 text-red-600 hover:border-red-200 hover:bg-red-50 py-3 px-4 rounded-xl font-bold transition-all mt-2"
                         >
                           <Trash2 size={18} />
                           {isMulti ? 'Cancelar Apartados' : 'Cancelar Apartado'}
                         </button>
                       </>
                     )}
                     {targetTickets.every(t => t.status === 'paid') && (
                        <>
                          <button 
                           onClick={() => {
                             setReceiptMode('paid');
                             setViewState('receipt');
                           }}
                           className="w-full flex justify-center items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white py-3 px-4 rounded-xl font-bold shadow-sm active:translate-y-[1px] transition-all"
                         >
                           <Share2 size={20} />
                           Generar Ticket de Pago
                         </button>
                         <button 
                           onClick={handleCancelPayment}
                           className="w-full flex justify-center items-center gap-2 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 py-3 px-4 rounded-xl font-bold transition-all mt-2"
                         >
                           Desmarcar Pago
                         </button>
                        </>
                     )}
                     {/* Estado mixto: algunos reserved, algunos paid */}
                     {!targetTickets.every(t => t.status === 'reserved') &&
                      !targetTickets.every(t => t.status === 'paid') && (
                       <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
                         <p className="text-sm font-semibold text-amber-800 mb-1">
                           Boletos con estados mixtos
                         </p>
                         <p className="text-xs text-amber-700 mb-4">
                           Los boletos seleccionados tienen estados distintos (apartados y pagados).
                           Gestiona cada boleto individualmente.
                         </p>
                         <button
                           onClick={onClose}
                           className="text-sm font-bold text-amber-700 underline underline-offset-2"
                         >
                           Cerrar
                         </button>
                       </div>
                     )}
                   </div>
                </div>
              )}
            </div>
          )
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-2xl flex justify-center border border-gray-200 overflow-hidden">
                 {/* Visual Ticket ref */}
                 {isDisplayMulti ? (
                   <TicketReceiptMulti
                     ref={receiptRef}
                     tickets={displayTickets}
                     raffle={raffle}
                     mode={receiptMode}
                   />
                 ) : (
                   <TicketReceipt 
                     ref={receiptRef} 
                     ticket={displayBase} 
                     raffle={raffle} 
                     mode={receiptMode}
                   />
                 )}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                 <button 
                   onClick={exportReceipt}
                   disabled={isExporting}
                   className="flex justify-center items-center gap-2 bg-gray-900 hover:bg-gray-800 disabled:opacity-70 text-white p-3 rounded-xl font-semibold shadow-sm transition-all text-sm sm:text-base whitespace-nowrap"
                 >
                   <Download size={18} />
                   {isExporting ? '...' : 'Descargar'}
                 </button>
                 <button 
                   onClick={copyWhatsAppText}
                   className="flex justify-center items-center gap-2 bg-green-500 hover:bg-green-600 text-white p-3 rounded-xl font-semibold shadow-sm transition-all text-center leading-tight whitespace-nowrap"
                 >
                   <Share2 size={18} />
                   Copiar Texto
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
