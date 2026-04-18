import React, { useState } from 'react';
import { useRaffles } from './RaffleContext';
import { useTandas } from './TandaContext';
import { PlusCircle, Ticket as TicketIcon, Calendar, ArrowRight, Trash2, X, Users, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';

export function Dashboard({ onSelectRaffle, onSelectTanda }: { onSelectRaffle: (id: string) => void, onSelectTanda: (id: string) => void }) {
  const { raffles, createRaffle, deleteRaffle } = useRaffles();
  const { tandas, createTanda, deleteTanda } = useTandas();
  
  const [activeTab, setActiveTab] = useState<'rifas' | 'tandas'>('rifas');
  const [showCreate, setShowCreate] = useState(false);

  // Form state for Rifas
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [totalTickets, setTotalTickets] = useState('100');
  const [opportunities, setOpportunities] = useState('1');
  const [distribution, setDistribution] = useState<'lineal' | 'aleatoria'>('lineal');
  const [drawDate, setDrawDate] = useState('');

  // Form state specifically for Tandas
  const [tandaWeeks, setTandaWeeks] = useState('7');
  const [tandaParticipants, setTandaParticipants] = useState('7');
  const [tandaStartDate, setTandaStartDate] = useState('');

  // Common optional state
  const [themeColor, setThemeColor] = useState('#10b981'); // Default emerald-500
  // FIX 1
  const [themeColorText, setThemeColorText] = useState('#10b981');
  const [useThemeColor, setUseThemeColor] = useState(false);

  const openCreate = () => {
    setName('');
    setDescription('');
    setPrice(activeTab === 'rifas' ? '100' : '300');
    setTotalTickets('100');
    setOpportunities('1');
    setDistribution('lineal');
    setDrawDate('');
    setTandaWeeks('7');
    setTandaParticipants('7');
    setTandaStartDate('');
    setThemeColor('#10b981');
    // FIX 1
    setThemeColorText('#10b981');
    setUseThemeColor(false);
    setShowCreate(true);
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const finalThemeColor = useThemeColor ? themeColor : undefined;
    
    if (activeTab === 'rifas') {
      createRaffle({
        name,
        description,
        pricePerTicket: parseFloat(price),
        totalTickets: parseInt(totalTickets, 10),
        opportunities: parseInt(opportunities, 10),
        distribution,
        drawDate,
        themeColor: finalThemeColor
      });
    } else {
      createTanda({
        name,
        description,
        pricePerWeek: parseFloat(price),
        numberOfWeeks: parseInt(tandaWeeks, 10),
        numberOfParticipants: parseInt(tandaParticipants, 10),
        startDate: tandaStartDate,
        themeColor: finalThemeColor
      });
    }
    setShowCreate(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Rifas Pro</h2>
          <p className="text-gray-500 mt-1">Administra tus sorteos y esquemas de tandas</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors shadow-sm"
        >
          <PlusCircle size={20} />
          Nueva {activeTab === 'rifas' ? 'Rifa' : 'Tanda'}
        </button>
      </div>

      <div className="flex bg-gray-200 p-1 rounded-xl max-w-sm">
        <button 
          onClick={() => setActiveTab('rifas')} 
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'rifas' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Mis Rifas
        </button>
        <button 
          onClick={() => setActiveTab('tandas')} 
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'tandas' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Mis Tandas
        </button>
      </div>

      <AnimatePresence>
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 perspective-[1000px]">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowCreate(false)}
            />
            <motion.div 
              initial={{ y: '100%', opacity: 1 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 1 }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="bg-white shadow-2xl w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-6 pb-12 sm:pb-6 relative z-10 max-h-[90vh] overflow-y-auto"
            >
              {/* Drag Handle for Mobile */}
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4 sm:hidden" />
              
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Crear Nueva {activeTab === 'rifas' ? 'Rifa' : 'Tanda'}</h3>
                <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-1 rounded-full transition-colors hidden sm:block">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre {activeTab === 'rifas' ? 'del sorteo o premio' : 'de la Tanda'}</label>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={activeTab === 'rifas' ? "Ej: Rifa iPhone 15 Pro" : "Ej: Tanda Docena Navajas"}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción corta</label>
                  <input 
                    type="text" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ej: A beneficio de..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
                
                {activeTab === 'rifas' ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Cant. Boletos</label>
                        <input 
                          type="number" required min="1" max="10000"
                          value={totalTickets}
                          onChange={(e) => setTotalTickets(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Precio c/u ($)</label>
                        <input 
                          type="number" required min="1"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 mt-2">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Oportunidades x Boleto</label>
                        <input 
                          type="number" required min="1" max="100"
                          value={opportunities}
                          onChange={(e) => setOpportunities(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                        />
                      </div>
                      {parseInt(opportunities || '1') > 1 && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">Distribución</label>
                          <select 
                            value={distribution}
                          // FIX 4
                          onChange={(e) => setDistribution(e.target.value as 'lineal' | 'aleatoria')}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                        >
                          <option value="lineal">Lineal (Secuencial)</option>
                          <option value="aleatoria">Aleatoria (Mezclada)</option>
                        </select>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1 mt-2">Fecha de Sorteo</label>
                    <input 
                      type="date" required
                      value={drawDate}
                      onChange={(e) => setDrawDate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none block"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Participantes</label>
                      <input 
                        type="number" required min="1" max="1000"
                        value={tandaParticipants}
                        onChange={(e) => setTandaParticipants(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Pago X Sem. ($)</label>
                      <input 
                        type="number" required min="1"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Duración (Semanas)</label>
                      <input 
                        type="number" required min="1" max="100"
                        value={tandaWeeks}
                        onChange={(e) => setTandaWeeks(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha de Inicio</label>
                      <input 
                        type="date" required
                        value={tandaStartDate}
                        onChange={(e) => setTandaStartDate(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none block"
                      />
                    </div>
                  </div>
                </>
              )}
              
              <div className="pt-2 border-t border-gray-100">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={useThemeColor} 
                    onChange={e => setUseThemeColor(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  Personalizar color de tema
                </label>
                {useThemeColor && (
                  <div className="flex items-center gap-3 mt-2">
                    {/* FIX 1 */}
                    <input 
                      type="color" 
                      value={themeColor} 
                      onChange={e => {
                        setThemeColor(e.target.value);
                        setThemeColorText(e.target.value);
                      }}
                      className="w-12 h-12 p-1 bg-white border border-gray-200 rounded-xl cursor-pointer"
                    />
                    <input 
                      type="text" 
                      value={themeColorText} 
                      onChange={e => {
                        const val = e.target.value;
                        setThemeColorText(val);
                        if (/^#[0-9a-fA-F]{6}$/.test(val)) {
                          setThemeColor(val);
                        }
                      }}
                      placeholder="#000000"
                      pattern="^#[0-9a-fA-F]{6}$"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono text-gray-700 uppercase"
                    />
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold mt-6 transition-colors"
              >
                Crear {activeTab === 'rifas' ? 'Rifa' : 'Tanda'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      {activeTab === 'rifas' && (
         raffles.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full mb-4">
              <TicketIcon size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No tienes rifas activas</h3>
            <p className="text-gray-500 max-w-sm mx-auto">Comienza creando tu primera rifa para empezar a vender.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {raffles.map(raffle => {
              const total = raffle.totalTickets;
              const opps = raffle.opportunities || 1;
              const ticketsArr = Object.values(raffle.tickets) as import('../types').Ticket[];
              const paid = ticketsArr.filter(t => t.status === 'paid').length;
              const reserved = ticketsArr.filter(t => t.status === 'reserved').length;
              const progress = ((paid + reserved) / total) * 100;

              let formattedDate = 'Sin fecha';
              if (raffle.drawDate) {
                try {
                  const [y, m, d] = raffle.drawDate.split('-');
                  formattedDate = format(new Date(Number(y), Number(m)-1, Number(d)), "dd MMM, yyyy", { locale: es });
                } catch(e) {}
              }

              return (
                <div 
                  key={raffle.id} 
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 cursor-pointer hover:border-emerald-500 hover:shadow-md transition-all group flex flex-col"
                  onClick={() => onSelectRaffle(raffle.id)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                      {total} Boletos {opps > 1 && `(${opps} opps)`}
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('¿Seguro que deseas eliminar esta rifa?')) deleteRaffle(raffle.id);
                      }}
                      className="text-gray-400 hover:text-red-500 p-1"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-emerald-700 transition-colors">
                    {raffle.name}
                  </h3>
                  {raffle.description && <p className="text-sm text-gray-500 mb-4 line-clamp-2">{raffle.description}</p>}
                  
                  <div className="mt-auto pt-4 space-y-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Calendar size={14} /> Sorteo</p>
                        <p className="font-semibold text-gray-900 text-sm">{formattedDate}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-1">Precio Boleto</p>
                        <p className="font-bold text-gray-900 text-lg">${raffle.pricePerTicket}</p>
                      </div>
                    </div>
                    <div className="space-y-2 pt-4 border-t border-gray-100">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-emerald-600">{paid + reserved} Vendidos/Apartados</span>
                        <span className="text-gray-400">{total - (paid + reserved)} Disp.</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden flex">
                        <div className="bg-emerald-500 h-2.5" style={{ width: `${(paid / total) * 100}%` }}></div>
                        <div className="bg-amber-400 h-2.5" style={{ width: `${(reserved / total) * 100}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {activeTab === 'tandas' && (
         tandas.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full mb-4">
              <Users size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No tienes tandas activas</h3>
            <p className="text-gray-500 max-w-sm mx-auto">Comienza creando una tanda para administrar planes de pago por semanas.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tandas.map(tanda => {
              let formattedDate = 'Sin fecha';
              if (tanda.startDate) {
                try {
                  const [y, m, d] = tanda.startDate.split('-');
                  formattedDate = format(new Date(Number(y), Number(m)-1, Number(d)), "dd MMM, yyyy", { locale: es });
                } catch(e) {}
              }

              return (
                <div 
                  key={tanda.id} 
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all group flex flex-col"
                  onClick={() => onSelectTanda(tanda.id)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                      {tanda.numberOfParticipants} Lugares • {tanda.numberOfWeeks} Semanas
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('¿Seguro que deseas eliminar esta tanda?')) deleteTanda(tanda.id);
                      }}
                      className="text-gray-400 hover:text-red-500 p-1"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-700 transition-colors">
                    {tanda.name}
                  </h3>
                  {tanda.description && <p className="text-sm text-gray-500 mb-4 line-clamp-2">{tanda.description}</p>}
                  
                  <div className="mt-auto pt-4 space-y-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Calendar size={14} /> Inicio</p>
                        <p className="font-semibold text-gray-900 text-sm">{formattedDate}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-1 flex items-center justify-end gap-1"><DollarSign size={14} /> Pago Semanal</p>
                        <p className="font-bold text-gray-900 text-lg">${tanda.pricePerWeek}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

    </div>
  );
}

