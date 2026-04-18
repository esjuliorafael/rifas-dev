import React, { useRef, useState, useMemo } from 'react';
import { useRaffles } from './RaffleContext';
import { useSettings } from './SettingsContext';
import { Download, Search, CheckCircle2, User, Clock, Check, Phone, CircleDashed } from 'lucide-react';
import { toJpeg } from 'html-to-image';
import { TicketModal } from './TicketModal';
import { Ticket } from '../types';
import { injectThemeColorIntoSvg } from '../utils/svgColor';

export function RaffleDetail({ raffleId }: { raffleId: string }) {
  const { getRaffle, updateRaffle } = useRaffles();
  const { settings } = useSettings();
  const raffle = getRaffle(raffleId);
  const gridRef = useRef<HTMLDivElement>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'available' | 'reserved' | 'paid'>('all');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  if (!raffle) {
    return <div>Rifa no encontrada</div>;
  }

  const allTickets = Object.values(raffle.tickets) as Ticket[];
  allTickets.sort((a, b) => parseInt(a.id) - parseInt(b.id));
  
  const filteredTickets = useMemo(() => {
    return allTickets.filter(t => {
      const matchStatus = filter === 'all' || t.status === filter;
      const matchSearch = String(t.id).includes(searchTerm) || 
                          t.numbers.some(n => String(n).includes(searchTerm)) || 
                          (t.ownerName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (t.ownerPhone || '').includes(searchTerm);
      return matchStatus && matchSearch;
    });
  }, [allTickets, filter, searchTerm]);

  const handleExport = async () => {
    if (!gridRef.current) return;
    setIsExporting(true);
    try {
      // Small delay to ensure rendering is settled
      await new Promise(res => setTimeout(res, 100));
      const dataUrl = await toJpeg(gridRef.current, { 
        quality: 0.95,
        backgroundColor: '#f9fafb', // gray-50
        style: {
          padding: '24px',
          margin: '0',
          borderRadius: '0'
        }
      });
      const link = document.createElement('a');
      link.download = `rifa-${raffle.name.replace(/\s+/g, '-').toLowerCase()}-boletos.jpeg`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error al exportar', err);
      alert('Hubo un error al exportar la imagen. Intenta desde un navegador de escritorio.');
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'paid') return 'bg-emerald-500 text-white border-emerald-600 shadow-emerald-500/20';
    if (status === 'reserved') return 'bg-amber-400 text-amber-900 border-amber-500 shadow-amber-500/20';
    return 'bg-white text-gray-700 border-gray-300 hover:border-emerald-400 hover:bg-emerald-50';
  };

  const getStatusLabel = (status: string) => {
    if (status === 'paid') return 'Pagado';
    if (status === 'reserved') return 'Apartado';
    return 'Disponible';
  };

  const currentCols = raffle.columnsPreference || 10;
  const getGridClasses = (cols: number) => {
    switch(cols) {
      case 5: return 'grid-cols-3 sm:grid-cols-5';
      case 8: return 'grid-cols-4 sm:grid-cols-8';
      case 12: return 'grid-cols-6 sm:grid-cols-12';
      case 10:
      default: return 'grid-cols-5 sm:grid-cols-10';
    }
  };

  const getTicketStyles = (cols: number) => {
    switch(cols) {
      case 5: return {
        padding: 'p-1.5 sm:p-[20px]',
        idSize: 'text-xl sm:text-[40px] sm:leading-[40px]',
        iconClass: 'w-4 h-4 sm:w-6 sm:h-6',
        nameSize: 'text-xs sm:text-[20px] sm:leading-[20px]',
        extraSize: 'text-[9px] sm:text-[16px] sm:leading-[16px]',
        extraPad: 'px-1 py-0.5 sm:p-1'
      };
      case 8: return {
        padding: 'p-1 sm:p-3',
        idSize: 'text-lg sm:text-2xl',
        iconClass: 'w-3.5 h-3.5 sm:w-5 sm:h-5',
        nameSize: 'text-[9px] sm:text-sm',
        extraSize: 'text-[8px] sm:text-xs',
        extraPad: 'p-[2px] sm:px-1 sm:py-0.5'
      };
      case 12: return {
        padding: 'p-0.5 sm:p-1.5',
        idSize: 'text-[11px] sm:text-base',
        iconClass: 'w-2.5 h-2.5 sm:w-3.5 sm:h-3.5',
        nameSize: 'text-[7px] sm:text-[9px]',
        extraSize: 'text-[6px] sm:text-[7px]',
        extraPad: 'px-[2px] py-[1px]'
      };
      case 10:
      default: return {
        padding: 'p-1 sm:p-2',
        idSize: 'text-sm sm:text-xl',
        iconClass: 'w-3 h-3 sm:w-4 sm:h-4',
        nameSize: 'text-[8.5px] sm:text-[11px]',
        extraSize: 'text-[7px] sm:text-[9px]',
        extraPad: 'px-[3px] py-[2px]'
      };
    }
  };

  const ticketStyles = getTicketStyles(currentCols);

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-gray-900">{raffle.name}</h2>
            {raffle.description && <p className="text-gray-500 mt-2 text-lg">{raffle.description}</p>}
          </div>
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl font-semibold transition-all disabled:opacity-70 whitespace-nowrap shadow-sm"
          >
            <Download size={18} />
            {isExporting ? 'Generando...' : 'Exportar Imagen'}
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Universo Boletos</p>
            <p className="text-2xl font-black text-gray-900">{raffle.totalUniverse || raffle.totalTickets}</p>
          </div>
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
            <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">Pagados</p>
            <p className="text-2xl font-black text-emerald-600">{allTickets.filter(t => t.status === 'paid').length}</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
            <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider mb-1">Apartados</p>
            <p className="text-2xl font-black text-amber-600">{allTickets.filter(t => t.status === 'reserved').length}</p>
          </div>
          <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Precio c/u</p>
            <p className="text-2xl font-black text-gray-900">${raffle.pricePerTicket}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar número, nombre o teléfono..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {(['all', 'available', 'reserved', 'paid'] as const).map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-colors ${
                filter === f 
                  ? 'bg-gray-900 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f === 'all' ? 'Todos' : getStatusLabel(f)}
            </button>
          ))}
          <div className="flex items-center gap-2 pl-2 md:ml-2 border-l border-gray-200">
             <span className="text-sm font-semibold text-gray-500 whitespace-nowrap">Columnas:</span>
             <select 
               value={currentCols}
               onChange={e => updateRaffle(raffleId, { columnsPreference: parseInt(e.target.value) })}
               className="bg-gray-100 border border-gray-200 rounded-lg text-sm font-semibold px-2 py-1.5 focus:ring-emerald-500 outline-none text-gray-700 cursor-pointer"
             >
               <option value="5">5</option>
               <option value="8">8</option>
               <option value="10">10</option>
               <option value="12">12</option>
             </select>
          </div>
        </div>
      </div>

      {/* Exportable Grid Container */}
      <div 
        className="rounded-2xl p-2 md:p-4 overflow-hidden border border-gray-200" 
        ref={gridRef}
        style={raffle.themeColor ? { backgroundColor: `${raffle.themeColor}1A` } : { backgroundColor: '#f9fafb' }}
      >
        <div className="mb-6 text-center">
          {settings.logoUrl && (
            // FIX 2
            <div className="flex flex-col items-center justify-center mb-4">
              <img 
                src={raffle.themeColor ? injectThemeColorIntoSvg(settings.logoUrl, raffle.themeColor) : settings.logoUrl} 
                alt="Logo" 
                className="w-auto h-24 sm:h-32 object-contain" 
              />
              {raffle.themeColor && (
                <div style={{ backgroundColor: raffle.themeColor, height: '3px', borderRadius: '9999px', marginTop: '8px' }} className="w-full max-w-sm" />
              )}
            </div>
          )}
          <h3 
            className="text-2xl font-black"
            style={raffle.themeColor ? { color: raffle.themeColor } : { color: '#111827' }}
          >
            {raffle.name}
          </h3>
          <p className="text-gray-500 font-medium">✨ Costo por boleto: <span className="font-bold" style={raffle.themeColor ? { color: raffle.themeColor } : { color: '#059669' }}>${raffle.pricePerTicket}</span> ✨</p>
        </div>

        <div className="flex gap-4 justify-center mb-6 text-sm font-semibold">
           <div className="flex items-center gap-1"><div className="w-4 h-4 rounded bg-white border border-gray-300"></div> Disponible</div>
           <div className="flex items-center gap-1"><div className="w-4 h-4 rounded bg-amber-400 border border-amber-500"></div> Apartado</div>
           <div className="flex items-center gap-1"><div className="w-4 h-4 rounded bg-emerald-500 border border-emerald-600"></div> Pagado</div>
        </div>

        <div className={`grid gap-2 md:gap-3 ${getGridClasses(currentCols)}`}>
          {filteredTickets.map(ticket => (
            <button
              key={ticket.id}
              onClick={() => setSelectedTicket(ticket)}
              className={`
                aspect-square rounded-xl flex flex-col justify-between border-2 border-b-4
                transition-all shadow-sm active:translate-y-[2px] active:border-b-2 overflow-hidden
                ${getStatusColor(ticket.status)}
                ${ticketStyles.padding}
              `}
              title={ticket.status !== 'available' ? ticket.ownerName : 'Disponible'}
            >
              <div className="flex justify-between items-start w-full">
                <span className={`font-black leading-none ${ticketStyles.idSize}`}>{ticket.id}</span>
                <span className="shrink-0 opacity-80">
                  {ticket.status === 'available' && <CircleDashed className={ticketStyles.iconClass} />}
                  {ticket.status === 'reserved' && <Clock className={ticketStyles.iconClass} />}
                  {ticket.status === 'paid' && <CheckCircle2 className={ticketStyles.iconClass} />}
                </span>
              </div>
              
              <div className="flex-1 w-full flex items-center justify-center text-center overflow-hidden h-full py-0.5 sm:py-1">
                <span className={`uppercase font-bold tracking-tight leading-tight line-clamp-2 break-words ${ticketStyles.nameSize}`}>
                  {ticket.status === 'available' ? 'Disponible' : ticket.ownerName}
                </span>
              </div>

              {ticket.numbers.length > 1 && (
                 <div className={`font-bold flex gap-0.5 sm:gap-1 flex-wrap justify-center opacity-80 leading-none w-full mt-0.5 ${ticketStyles.extraSize}`}>
                    {ticket.numbers.slice(1).map(n => <span key={n} className={`bg-black/10 rounded-sm ${ticketStyles.extraPad}`}>{n}</span>)}
                 </div>
              )}
            </button>
          ))}
        </div>
        
        {filteredTickets.length === 0 && (
          <div className="text-center py-12 text-gray-500 font-medium">
            No se encontraron boletos con ese criterio.
          </div>
        )}
      </div>

      {selectedTicket && (
        <TicketModal 
          raffleId={raffleId}
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </div>
  );
}
