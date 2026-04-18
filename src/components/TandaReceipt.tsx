import React, { forwardRef } from 'react';
import { Tanda, TandaParticipant } from '../types';
import { addDays, format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Props {
  tanda: Tanda;
  participant: TandaParticipant;
}

export const TandaReceipt = forwardRef<HTMLDivElement, Props>(({ tanda, participant }, ref) => {
  const getWeekDate = (weekNum: number) => {
    if (!tanda.startDate) return null;
    const [y, m, d] = tanda.startDate.split('-');
    const date = new Date(Number(y), Number(m)-1, Number(d));
    const targetDate = addDays(date, (weekNum - 1) * 7);
    return targetDate;
  };

  const paidCount = participant.payments.filter(p => p !== null).length;
  const isComplete = paidCount === tanda.numberOfWeeks;

  return (
    <div 
      ref={ref} 
      className="bg-white w-[300px] shadow-sm overflow-hidden relative border border-gray-200 rounded-lg flex flex-col font-sans"
    >
      {/* Receipt Header */}
      <div className={`p-5 text-center text-white ${isComplete ? 'bg-emerald-600' : 'bg-blue-600'}`}>
         <h2 className="text-xl font-black tracking-tighter leading-none mb-1 uppercase">{tanda.name}</h2>
         <p className="text-xs font-semibold opacity-90">{tanda.description}</p>
      </div>
      
      {/* Jagged edge simulation */}
      <div className="h-2 w-full flex space-x-[2px] bg-white -mt-1 z-10 px-1 overflow-hidden" style={{ filter: 'drop-shadow(0 -1px 0 rgba(0,0,0,0.05))' }}>
         {Array.from({ length: 30 }).map((_, i) => (
           <div key={i} className={`w-3 h-3 rounded-full -mt-2 ${isComplete ? 'bg-emerald-600' : 'bg-blue-600'}`} />
         ))}
      </div>

      <div className="p-6 text-center">
         <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Participante</p>
         <h3 className="text-2xl font-black text-gray-900 uppercase leading-none">{participant.name}</h3>
         
         <div className="mt-4 inline-flex items-center justify-center bg-gray-100 rounded-xl px-4 py-2 border border-gray-200">
           <div>
             <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-0.5">Lugar Asignado</p>
             <p className="font-black text-xl text-blue-700 leading-none">#{participant.id}</p>
           </div>
         </div>

         <div className="mt-6 flex justify-between items-center pb-3 border-b border-gray-100 px-2 lg:px-4">
            <div className="text-left">
               <p className="text-[9px] uppercase font-bold text-gray-400">Pago Semanal</p>
               <p className="font-black text-gray-900">${tanda.pricePerWeek}</p>
            </div>
            <div className="text-right">
               <p className="text-[9px] uppercase font-bold text-gray-400">Entrega Estimada</p>
               <p className="font-bold text-gray-900 text-xs mt-0.5 whitespace-nowrap">
                  {getWeekDate(tanda.numberOfWeeks) ? format(getWeekDate(tanda.numberOfWeeks)!, "dd MMM, yyyy", { locale: es }) : 'N/A'}
               </p>
            </div>
         </div>

         {/* Weeks list */}
         <div className="mt-4 text-left space-y-2">
            {participant.payments.map((payment, idx) => {
               const weekNum = idx + 1;
               const isPaid = payment !== null;
               const targetDate = getWeekDate(weekNum);
               const dateStr = targetDate ? format(targetDate, "dd MMM", { locale: es }) : '';

               return (
                  <div key={idx} className="flex justify-between items-center text-xs">
                     <span className={`font-semibold ${isPaid ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                       Semana {weekNum} <span className="opacity-60 text-[10px]">({dateStr})</span>
                     </span>
                     {isPaid ? (
                        <span className="font-bold text-emerald-600 uppercase tracking-wider text-[10px] bg-emerald-50 px-2 py-0.5 rounded">Pagado</span>
                     ) : (
                        <span className="font-bold text-gray-300">-----</span>
                     )}
                  </div>
               )
            })}
         </div>

         <div className="mt-6 pt-4 border-t border-gray-200">
            {isComplete ? (
               <div className="bg-emerald-100 text-emerald-800 py-2 rounded-lg font-black uppercase text-sm border border-emerald-200">
                 Producto Liquidado
               </div>
            ) : (
               <div className="bg-blue-50 text-blue-800 py-2 rounded-lg font-black uppercase text-xs border border-blue-100">
                 Avance: {paidCount} de {tanda.numberOfWeeks} semanas
               </div>
            )}
         </div>

         <p className="text-[8px] text-gray-300 font-mono mt-4 text-center">
             TND-{participant.id}-{crypto.randomUUID().split('-')[0].toUpperCase()}
         </p>
      </div>
    </div>
  );
});
