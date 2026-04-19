import React, { forwardRef, useMemo } from 'react';
import { Ticket, Raffle } from '../types';
import { format } from 'date-fns';
import { useSettings } from './SettingsContext';

interface Props {
  ticket: Ticket;
  raffle: Raffle;
  mode: 'reserved' | 'paid';
}

export const TicketReceipt = forwardRef<HTMLDivElement, Props>(({ ticket, raffle, mode }, ref) => {
  const { settings } = useSettings();
  const isPaid = mode === 'paid';
  
  // Fondo de sección 1
  const headerBgColor = raffle.themeColor 
    ? raffle.themeColor 
    : (isPaid ? '#059669' : '#111827'); // emerald-600 : gray-900

  const hasPaymentInfo = settings.paymentClabe || settings.paymentCard;
  const showPaymentSection = !isPaid && hasPaymentInfo;

  const formatClabe = (clabe?: string) => {
    if (!clabe) return '';
    if (clabe.length === 18) {
      return `${clabe.slice(0,3)} ${clabe.slice(3,6)} ${clabe.slice(6,12)} ${clabe.slice(12,18)}`;
    }
    return clabe;
  };

  const formatCard = (card?: string) => {
    if (!card) return '';
    if (card.length >= 4) {
      return `•••• ${card.slice(-4)}`;
    }
    return card;
  };

  const refCode = useMemo(() => {
     return `REF-${ticket.id}-${crypto.randomUUID().split('-')[0].toUpperCase()}`;
  }, [ticket.id]);

  const dateValue = isPaid ? ticket.paidAt : ticket.reservedAt;

  return (
    <div 
      ref={ref} 
      className="w-[320px] max-w-[320px] bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden relative"
      style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
    >
      {/* SECCIÓN 1 — HEADER */}
      <div 
        className="px-6 py-6 text-center flex flex-col items-center"
        style={{ backgroundColor: headerBgColor }}
      >
        <p className="text-sm font-bold text-white opacity-80 truncate w-full">{raffle.name}</p>
        
        <div className="mt-2 mb-3">
          <span className="text-6xl font-black text-white leading-none">{ticket.id}</span>
        </div>

        {ticket.numbers.length > 1 && (
          <div className="flex flex-wrap justify-center gap-1.5 mb-4 max-w-[250px]">
            {ticket.numbers.slice(1).map(n => (
              <span key={n} className="bg-white/20 px-2 py-0.5 rounded text-xs font-bold text-white">
                {n}
              </span>
            ))}
          </div>
        )}

        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isPaid ? 'bg-white text-emerald-700' : 'bg-white text-gray-900'}`}>
          {isPaid ? 'PAGADO ✅' : 'APARTADO ⏳'}
        </div>
      </div>
      
      {/* DIVIDER FÍSICO 1 */}
      <div className="relative h-6 flex items-center justify-center -my-3 z-10">
         <div className="w-6 h-6 bg-gray-50 rounded-full border-r border-gray-200 absolute -left-3"></div>
         <div className="w-full border-t-2 border-dashed border-gray-300"></div>
         <div className="w-6 h-6 bg-gray-50 rounded-full border-l border-gray-200 absolute -right-3"></div>
      </div>

      {/* SECCIÓN 2 — DATOS DEL PARTICIPANTE */}
      <div className="px-6 py-5 pt-4 bg-white">
        <div className="mb-4 text-center">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Participante</p>
          <p className="text-lg font-black text-gray-900 uppercase truncate w-full">{ticket.ownerName}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-center">
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Boleto</p>
            <p className="font-bold text-gray-900">{ticket.id}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Costo</p>
            <p className="font-bold text-gray-900">${raffle.pricePerTicket}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Fecha Sorteo</p>
            <p className="font-bold text-gray-900 text-sm">
               {raffle.drawDate ? format(new Date(raffle.drawDate), "dd/MM/yyyy") : 'Pendiente'}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Fecha Registro</p>
            <p className="font-bold text-gray-900 text-sm">
               {dateValue ? format(new Date(dateValue), "dd/MM/yyyy") : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* SECCIÓN 3 — DATOS DE PAGO */}
      {showPaymentSection && (
        <>
          {/* DIVIDER FÍSICO 2 */}
          <div className="relative h-6 flex items-center justify-center -my-3 z-10">
             <div className="w-6 h-6 bg-gray-50 rounded-full border-r border-gray-200 absolute -left-3"></div>
             <div className="w-full border-t-2 border-dashed border-gray-300"></div>
             <div className="w-6 h-6 bg-gray-50 rounded-full border-l border-gray-200 absolute -right-3"></div>
          </div>

          <div className="bg-gray-50 pt-5 pb-4 px-6 border-y border-gray-100">
            <div className="text-center mb-4">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Total a pagar</p>
              <p className="text-2xl font-black text-gray-900 leading-none">${raffle.pricePerTicket}</p>
            </div>

            <div className="space-y-2 border-t border-gray-200 pt-4">
              {settings.paymentBank && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-semibold">Banco</span>
                  <span className="text-gray-900 font-bold text-right">{settings.paymentBank}</span>
                </div>
              )}
              {settings.paymentClabe && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-semibold">CLABE</span>
                  <span className="text-gray-900 font-bold font-mono tracking-wide text-right">{formatClabe(settings.paymentClabe)}</span>
                </div>
              )}
              {settings.paymentCard && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-semibold">Tarjeta</span>
                  <span className="text-gray-900 font-bold font-mono tracking-wide text-right">{formatCard(settings.paymentCard)}</span>
                </div>
              )}
              {settings.paymentName && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-semibold">A nombre de</span>
                  <span className="text-gray-900 font-bold truncate max-w-[140px] text-right">{settings.paymentName}</span>
                </div>
              )}
              {settings.paymentAlias && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-semibold">Alias</span>
                  <span className="text-gray-900 font-bold truncate max-w-[140px] text-right">{settings.paymentAlias}</span>
                </div>
              )}
            </div>

            {settings.paymentPhone && (
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] leading-tight text-amber-800 font-semibold text-center">
                ⚠️ El único número autorizado para confirmar tu pago es {settings.paymentPhone}
              </div>
            )}
          </div>
        </>
      )}

      {/* SECCIÓN 4 — FOOTER */}
      <div className={`${showPaymentSection ? 'bg-gray-50 border-t border-gray-100' : 'bg-white border-t border-gray-100'} px-6 pb-6 pt-4 text-center`}>
         <p className="text-xs text-gray-500 font-medium tracking-wide leading-tight">
           {isPaid 
             ? '¡Ya estás participando! Mucha suerte en el sorteo.' 
             : 'Aparta con vigencia de 3 días. Realiza tu pago para confirmar.'}
         </p>
         <p className="text-[8px] text-gray-300 font-mono mt-3">
           {refCode}
         </p>
      </div>
    </div>
  );
});

TicketReceipt.displayName = 'TicketReceipt';
