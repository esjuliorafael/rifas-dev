import React, { forwardRef, useMemo } from 'react';
import { Ticket, Raffle } from '../types';
import { format } from 'date-fns';
import { useSettings } from './SettingsContext';

interface Props {
  tickets: Ticket[];
  raffle: Raffle;
  mode: 'reserved' | 'paid';
}

export const TicketReceiptMulti = forwardRef<HTMLDivElement, Props>(({ tickets, raffle, mode }, ref) => {
  const { settings } = useSettings();
  const isPaid = mode === 'paid';
  
  const headerBgColor = raffle.themeColor 
    ? raffle.themeColor 
    : (isPaid ? '#059669' : '#111827');

  const hasPaymentInfo = settings.paymentClabe || settings.paymentCard;
  const showPaymentSection = !isPaid && hasPaymentInfo;

  const baseTicket = tickets[0] || {};
  const participantName = baseTicket.ownerName || '';
  const dateValue = isPaid ? baseTicket.paidAt : baseTicket.reservedAt;

  const formatClabe = (clabe?: string) => {
    if (!clabe) return '';
    if (clabe.length === 18) {
      return `${clabe.slice(0,3)} ${clabe.slice(3,6)} ${clabe.slice(6,12)} ${clabe.slice(12,18)}`;
    }
    return clabe;
  };

  const formatCard = (card?: string) => {
    if (!card) return '';
    return card.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
  };

  const refCode = useMemo(() => {
     return `REF-MULTI-${crypto.randomUUID().split('-')[0].toUpperCase()}`;
  }, [tickets]);

  const totalPrice = raffle.pricePerTicket * tickets.length;

  return (
    <div 
      ref={ref} 
      className="w-[320px] max-w-[320px] bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden relative"
      style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
    >
      {/* SECCIÓN 1 — HEADER */}
      <div 
        className="px-6 py-8 text-center flex flex-col items-center"
        style={{ backgroundColor: headerBgColor }}
      >
        {settings.logoUrl && (
          <img
            src={settings.logoUrl}
            alt="Logo"
            style={{
              width: '56px',
              height: '56px',
              objectFit: 'contain',
              marginBottom: '12px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              padding: '4px'
            }}
          />
        )}
        <p className="text-xs font-bold text-white/80 uppercase tracking-widest truncate w-full mb-1">
          {raffle.name}
        </p>
        
        <div className="mt-1 mb-3">
          <span className="text-4xl font-black text-white leading-none tracking-tighter uppercase uppercase">
            {tickets.length} BOLETOS
          </span>
        </div>

        <div className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${isPaid ? 'bg-white text-[#059669]' : 'bg-white text-gray-900'} shadow-sm`}>
          {isPaid ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <span>Pagado</span>
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>Apartado</span>
            </>
          )}
        </div>
      </div>
      
      {/* DIVIDER FÍSICO 1 */}
      <div className="relative h-6 flex items-center justify-center -my-3 z-10">
         <div className="w-6 h-6 bg-gray-50 rounded-full border border-gray-200 absolute -left-3" style={{ clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)' }}></div>
         <div className="w-full border-t border-dashed border-gray-300"></div>
         <div className="w-6 h-6 bg-gray-50 rounded-full border border-gray-200 absolute -right-3" style={{ clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' }}></div>
      </div>

      {/* SECCIÓN 2 — DATOS DEL PARTICIPANTE */}
      <div className="px-6 py-6 pb-5 bg-white">
        <div className="mb-5 text-center bg-gray-50 rounded-xl p-3 border border-gray-100">
          <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1">Participante</p>
          <p className="text-xl font-black text-gray-900 uppercase truncate w-full">{participantName}</p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center my-3 pb-3">
          {tickets.map(t => (
            <div 
              key={t.id} 
              className="text-white text-center flex flex-col justify-center px-3 py-2 rounded-xl"
              style={{ backgroundColor: headerBgColor }}
            >
              <div className="font-black text-lg leading-none">{t.id}</div>
              {t.numbers.length > 1 && (
                <div className="text-[9px] font-bold text-white/80 mt-1 uppercase tracking-wider leading-none">
                  {t.numbers.slice(1).join(' ')}
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-2 gap-y-5 gap-x-2 text-center border-t border-gray-100 pt-5">
          <div>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1">Costo Unitario</p>
            <p className="font-bold text-gray-900 text-sm">${raffle.pricePerTicket}</p>
          </div>
          <div>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1">Total a pagar</p>
            <p className="font-black text-emerald-600 text-sm">${totalPrice}</p>
          </div>
          <div>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1">Fecha Sorteo</p>
            <p className="font-bold text-gray-900 text-sm">
               {raffle.drawDate ? format(new Date(raffle.drawDate), "dd/MM/yyyy") : 'Pendiente'}
            </p>
          </div>
          <div>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1">Fecha Registro</p>
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
             <div className="w-6 h-6 bg-gray-50 rounded-full border border-gray-200 absolute -left-3" style={{ clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)' }}></div>
             <div className="w-full border-t border-dashed border-gray-300"></div>
             <div className="w-6 h-6 bg-gray-50 rounded-full border border-gray-200 absolute -right-3" style={{ clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' }}></div>
          </div>

          <div className="bg-white px-6 py-5">
            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4">
              <div className="text-center mb-4 pb-4 border-b border-gray-200 border-dashed">
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1">Total a pagar</p>
                <p className="text-3xl font-black text-gray-900 leading-none">${totalPrice}</p>
              </div>

              <div className="space-y-3">
                {settings.paymentBank && (
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>
                      <span className="font-semibold uppercase tracking-wider text-[9px]">Banco</span>
                    </div>
                    <span className="text-gray-900 font-bold">{settings.paymentBank}</span>
                  </div>
                )}
                {settings.paymentClabe && (
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>
                      <span className="font-semibold uppercase tracking-wider text-[9px]">CLABE</span>
                    </div>
                    <span className="text-gray-900 font-bold font-mono tracking-tight">{formatClabe(settings.paymentClabe)}</span>
                  </div>
                )}
                {settings.paymentCard && (
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                      <span className="font-semibold uppercase tracking-wider text-[9px]">Tarjeta</span>
                    </div>
                    <span className="text-gray-900 font-bold font-mono tracking-tight">{formatCard(settings.paymentCard)}</span>
                  </div>
                )}
                {settings.paymentName && (
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      <span className="font-semibold uppercase tracking-wider text-[9px]">Titular</span>
                    </div>
                    <span className="text-gray-900 font-bold truncate max-w-[120px]">{settings.paymentName}</span>
                  </div>
                )}
              </div>

              {settings.paymentPhone && (
                <div className="mt-4 bg-gray-100 border border-gray-200 rounded-lg p-2.5 flex items-start gap-2">
                  <svg className="text-gray-600 shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  <p className="text-[10px] leading-snug text-gray-700 font-semibold text-left">
                    El único número autorizado para envíos de comprobantes y confirmar este pago es <span className="font-bold text-gray-900">{settings.paymentPhone}</span>.
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* SECCIÓN 4 — FOOTER */}
      <div className={`${showPaymentSection ? 'border-t border-gray-100/50' : 'border-t border-gray-100'} px-6 pb-6 pt-5 bg-white text-center`}>
         <p className="text-[11px] text-gray-500 font-medium tracking-wide leading-relaxed px-2">
           {isPaid 
             ? '¡Sus accesos están confirmados! Mucha suerte en el sorteo.' 
             : 'Estos boletos tienen una reserva de vigencia limitada (3 días). Por favor realiza tu pago.'}
         </p>
         <div className="mt-4 inline-block bg-gray-50 border border-gray-100 px-3 py-1 rounded-md">
           <p className="text-[9px] text-gray-400 font-mono tracking-widest uppercase">
             {refCode}
           </p>
         </div>
      </div>
    </div>
  );
});

TicketReceiptMulti.displayName = 'TicketReceiptMulti';
