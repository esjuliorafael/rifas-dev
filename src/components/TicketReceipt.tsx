import React, { forwardRef } from 'react';
import { Ticket, Raffle } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Props {
  ticket: Ticket;
  raffle: Raffle;
  mode: 'reserved' | 'paid';
}

export const TicketReceipt = forwardRef<HTMLDivElement, Props>(({ ticket, raffle, mode }, ref) => {
  const isPaid = mode === 'paid';
  const colorBase = isPaid ? 'emerald' : 'amber';
  
  // Tailwind classes statically injected
  const headerBgClass = isPaid ? 'bg-emerald-600 outline-emerald-600/20' : 'bg-gray-900 outline-gray-900/20';
  const badgeClass = isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800';

  return (
    <div 
      ref={ref} 
      className="w-full max-w-[320px] bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden relative"
    >
      {/* Ticket Header */}
      <div className={`${headerBgClass} px-6 py-6 text-center text-white relative outline outline-4 -outline-offset-1`}>
         <div className="absolute top-0 inset-x-0 h-1 bg-white/20"></div>
         <h4 className="font-black text-2xl uppercase tracking-widest opacity-90">TICKET</h4>
         <p className="text-sm font-medium opacity-80 mt-1">{raffle.name}</p>
         
         <div className="mt-4 mb-2">
            <span className="text-5xl font-black leading-none">{ticket.id}</span>
            {ticket.numbers.length > 1 && (
              <div className="mt-2.5 flex flex-wrap justify-center gap-1.5">
                 {ticket.numbers.slice(1).map(n => (
                    <span key={n} className="bg-white/20 px-1.5 py-0.5 rounded text-xs font-bold opacity-100">{n}</span>
                 ))}
              </div>
            )}
         </div>
         
         <div className="inline-block bg-white text-gray-900 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider shadow-sm">
            {isPaid ? 'PAGADO ✅' : 'APARTADO ⏳'}
         </div>
      </div>
      
      {/* Divider */}
      <div className="relative h-6 flex items-center justify-center -my-3 z-10">
         <div className="w-6 h-6 bg-gray-50 rounded-full border-r border-gray-200 absolute -left-3"></div>
         <div className="w-full border-t-2 border-dashed border-gray-300"></div>
         <div className="w-6 h-6 bg-gray-50 rounded-full border-l border-gray-200 absolute -right-3"></div>
      </div>

      {/* Ticket Body */}
      <div className="px-6 pb-6 pt-4 space-y-4">
        <div>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Participante</p>
          <p className="font-bold text-gray-900 text-lg uppercase">{ticket.ownerName}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Costo</p>
            <p className="font-bold text-gray-900">${raffle.pricePerTicket}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Sorteo</p>
            <p className="font-bold text-gray-900">
               {raffle.drawDate ? format(new Date(raffle.drawDate), "dd/MM/yyyy") : 'Pendiente'}
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 text-center">
           <p className="text-xs text-gray-400 font-medium tracking-wide">
             {isPaid 
               ? '¡Mucha suerte en el sorteo!' 
               : 'Recuerda realizar tu pago para asegurar tu boleto.'}
           </p>
           {/* Validation code to look cool */}
           <p className="text-[8px] text-gray-300 font-mono mt-3">
             REF-{ticket.id}-{crypto.randomUUID().split('-')[0].toUpperCase()}
           </p>
        </div>
      </div>
    </div>
  );
});

TicketReceipt.displayName = 'TicketReceipt';
