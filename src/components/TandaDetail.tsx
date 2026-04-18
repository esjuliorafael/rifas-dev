import React, { useRef, useState } from 'react';
import { useTandas } from './TandaContext';
import { useSettings } from './SettingsContext';
import { Download, Users, ArrowLeft, CheckCircle2, CircleDashed, Circle } from 'lucide-react';
import { toJpeg } from 'html-to-image';
import { TandaParticipant } from '../types';
import { TandaParticipantModal } from './TandaParticipantModal';
import { addDays, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { injectThemeColorIntoSvg } from '../utils/svgColor';
import { blendWithWhite } from '../utils/color';

export function TandaDetail({ tandaId, onClose }: { tandaId: string, onClose: () => void }) {
  const { getTanda } = useTandas();
  const { settings } = useSettings();
  const tanda = getTanda(tandaId);
  const gridRef = useRef<HTMLDivElement>(null);
  
  const [selectedParticipant, setSelectedParticipant] = useState<TandaParticipant | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  if (!tanda) return null;

  const getWeekDate = (weekNum: number) => {
    if (!tanda.startDate) return null;
    const [y, m, d] = tanda.startDate.split('-');
    const date = new Date(Number(y), Number(m)-1, Number(d));
    const targetDate = addDays(date, (weekNum - 1) * 7);
    return targetDate;
  };

  const exportGrid = async () => {
    if (!gridRef.current) return;
    setIsExporting(true);
    try {
      await new Promise(res => setTimeout(res, 100));
      const dataUrl = await toJpeg(gridRef.current, { 
        quality: 0.95,
        backgroundColor: tanda.themeColor ? blendWithWhite(tanda.themeColor, 0.1) : '#ffffff'
      });
      const link = document.createElement('a');
      link.download = `tanda-${tanda.name.toLowerCase().replace(/\s+/g, '-')}.jpeg`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error(err);
      alert('Error exportando imagen');
    } finally {
      setIsExporting(false);
    }
  };

  const participants = Object.values(tanda.participants);
  const weeksArray = Array.from({ length: tanda.numberOfWeeks }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <button 
            onClick={onClose}
            className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 mb-2 transition-colors"
          >
            <ArrowLeft size={16} /> Volver a Tandas
          </button>
          <h2 className="text-3xl font-black text-gray-900">{tanda.name}</h2>
          <p className="text-gray-500 mt-1">{tanda.description}</p>
        </div>
        <button
          onClick={exportGrid}
          disabled={isExporting}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-75 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm transition-all"
        >
          <Download size={18} />
          <span className="hidden sm:inline">{isExporting ? 'Exportando...' : 'Exportar Imagen'}</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
           <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Participantes</p>
           <p className="text-2xl font-black text-gray-900">{tanda.numberOfParticipants}</p>
        </div>
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
           <p className="text-xs font-semibold text-blue-800 uppercase tracking-wider mb-1">Semanas</p>
           <p className="text-2xl font-black text-blue-600">{tanda.numberOfWeeks}</p>
        </div>
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
           <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">Pago Semanal</p>
           <p className="text-2xl font-black text-emerald-600">${tanda.pricePerWeek}</p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
           <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Costo Total</p>
           <p className="text-2xl font-black text-gray-900">${tanda.pricePerWeek * tanda.numberOfWeeks}</p>
        </div>
      </div>

      <div className="overflow-x-auto pb-4">
        {/* Grid Export Container */}
        <div 
          ref={gridRef} 
          className="min-w-max p-6 rounded-3xl border border-gray-200"
          style={tanda.themeColor ? { backgroundColor: `${tanda.themeColor}1A` } : { backgroundColor: '#ffffff' }}
        >
          <div className="mb-6 text-center">
            {settings.logoUrl && (
              // FIX 2
              <div className="flex flex-col items-center justify-center mb-4">
                <img 
                  src={tanda.themeColor ? injectThemeColorIntoSvg(settings.logoUrl, tanda.themeColor) : settings.logoUrl} 
                  alt="Logo" 
                  className="w-auto h-24 sm:h-32 object-contain" 
                />
                {tanda.themeColor && (
                  <div style={{ backgroundColor: tanda.themeColor, height: '3px', borderRadius: '9999px', marginTop: '8px' }} className="w-full max-w-sm" />
                )}
              </div>
            )}
            <h3 
              className="text-2xl font-black uppercase tracking-tight"
              style={tanda.themeColor ? { color: tanda.themeColor } : { color: '#111827' }}
            >
              {tanda.name}
            </h3>
            <p className="text-gray-500 font-medium">
              {tanda.numberOfWeeks} Semanas x <span className="font-bold" style={tanda.themeColor ? { color: tanda.themeColor } : { color: '#2563eb' }}>${tanda.pricePerWeek}</span>
            </p>
          </div>

          <div className="min-w-max pb-4">
            {/* Encabezados alineados con la cuadrícula */}
            <div 
              className="grid items-end gap-2 px-3 mb-4 border-b border-gray-200 pb-3"
              style={{ gridTemplateColumns: `minmax(240px, 1fr) repeat(${tanda.numberOfWeeks}, 64px)` }}
            >
              <div className="text-gray-500 text-xs uppercase font-bold tracking-wider pl-2">Lugar y Participante</div>
              {weeksArray.map(w => {
                const d = getWeekDate(w);
                return (
                  <div key={w} className="text-center flex flex-col items-center justify-end">
                    <span className="text-blue-600 text-xs uppercase font-bold">S{w}</span>
                    {d && <span className="text-[10px] text-gray-400 font-medium normal-case mt-0.5">{format(d, "dd MMM", { locale: es })}</span>}
                  </div>
                );
              })}
            </div>

            {/* Fila de Tarjetas / Cards */}
            <div className="flex flex-col gap-3">
              {participants.map(p => {
                const isAvailable = p.status === 'available';
                
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedParticipant(p)}
                    className={`
                      w-full text-left border hover:shadow-md rounded-2xl p-2.5 sm:p-3 transition-all grid items-center gap-2 group
                      ${isAvailable ? 'bg-white border-dashed border-gray-300 hover:border-gray-400' : 'bg-white border-2 border-gray-100 hover:border-blue-300'}
                    `}
                    style={{ gridTemplateColumns: `minmax(240px, 1fr) repeat(${tanda.numberOfWeeks}, 64px)` }}
                  >
                    <div className="flex items-center gap-3 pr-4 border-r border-gray-100">
                      <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center font-black text-base
                        ${isAvailable ? 'bg-gray-100 text-gray-500' : 'bg-blue-600 text-white shadow-sm'}
                      `}>
                         {p.id}
                      </div>
                      <div className="font-bold text-sm uppercase truncate font-sans tracking-tight">
                        {isAvailable ? (
                          <span className="text-gray-400">Lugar Disponible</span>
                        ) : (
                          <span className="text-gray-900">{p.name}</span>
                        )}
                      </div>
                    </div>
                    {weeksArray.map(w => {
                      const isPaid = p.payments[w-1] !== null;
                      return (
                        <div key={w} className="flex items-center justify-center">
                          {isAvailable ? (
                            <CircleDashed className="text-gray-200 w-5 h-5 mx-auto" />
                          ) : isPaid ? (
                            <CheckCircle2 className="text-emerald-500 w-6 h-6 mx-auto drop-shadow-sm" />
                          ) : (
                            <Circle className="text-gray-300 w-5 h-5 mx-auto group-hover:text-blue-300 transition-colors" />
                          )}
                        </div>
                      );
                    })}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {selectedParticipant && (
        <TandaParticipantModal 
          tandaId={tandaId}
          participant={selectedParticipant}
          onClose={() => setSelectedParticipant(null)}
        />
      )}
    </div>
  );
}
