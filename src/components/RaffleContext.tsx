import React, { createContext, useContext, useState, useEffect } from 'react';
import { Raffle, Ticket } from '../types';
import { supabase } from '../utils/supabase';

interface RaffleContextType {
  raffles: Raffle[];
  loading: boolean;
  createRaffle: (raffle: any) => Promise<void>;
  deleteRaffle: (id: string) => Promise<void>;
  updateTicket: (raffleId: string, ticketId: string, updates: Partial<Ticket>) => Promise<void>;
  updateRaffle: (raffleId: string, updates: Partial<Raffle>) => Promise<void>;
  getRaffle: (id: string) => Raffle | undefined;
  refreshRaffles: () => Promise<void>;
}

const RaffleContext = createContext<RaffleContextType | undefined>(undefined);

export function RaffleProvider({ children }: { children: React.ReactNode }) {
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRaffles = async () => {
    try {
      setLoading(true);
      const { data: rafflesData, error: rafflesError } = await supabase
        .from('raffles')
        .select('*')
        .order('created_at', { ascending: false });

      if (rafflesError) throw rafflesError;

      const { data: allTicketsData, error: allTicketsError } = await supabase
        .from('tickets')
        .select('*');

      if (allTicketsError) throw allTicketsError;

      const fullRaffles: Raffle[] = (rafflesData || []).map((r) => {
        const ticketsMap: Record<string, Ticket> = {};
        (allTicketsData || [])
          .filter(t => t.raffle_id === r.id)
          .forEach(t => {
            ticketsMap[t.number] = {
              id: t.number,
              status: t.status as any,
              ownerName: t.owner_name || undefined,
              ownerPhone: t.owner_phone || undefined,
              paidAt: t.paid_at || undefined,
              numbers: t.extra_numbers ? [t.number, ...t.extra_numbers] : [t.number]
            };
          });

        return {
          id: r.id,
          name: r.title,
          title: r.title,
          description: r.description || '',
          pricePerTicket: Number(r.ticket_price),
          totalTickets: r.total_tickets,
          opportunities: r.opportunities || 1,
          distribution: r.distribution || 'lineal',
          createdAt: r.created_at,
          drawDate: r.draw_date,
          themeColor: r.theme_color,
          columnsPreference: r.columns_preference || 10, // Recuperar preferencia
          totalUniverse: r.total_tickets * (r.opportunities || 1),
          tickets: ticketsMap
        } as Raffle;
      });

      setRaffles(fullRaffles);
    } catch (error) {
      console.error('Error fetching raffles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRaffles();
  }, []);

  const createRaffle = async (data: any) => {
    try {
      const totalUniverse = data.totalTickets * data.opportunities;
      const isPowerOf10 = (totalUniverse === 10 || totalUniverse === 100 || totalUniverse === 1000 || totalUniverse === 10000);
      
      const maxNumberStr = isPowerOf10 ? (totalUniverse - 1).toString() : totalUniverse.toString();
      const padLength = Math.max(maxNumberStr.length, 2);
      const formatNum = (num: number) => num.toString().padStart(padLength, '0');

      const { data: newRaffleData, error: raffleError } = await supabase
        .from('raffles')
        .insert([{
          title: data.name,
          description: data.description,
          ticket_price: data.pricePerTicket,
          total_tickets: data.totalTickets,
          opportunities: data.opportunities,
          distribution: data.distribution,
          draw_date: data.drawDate,
          theme_color: data.themeColor,
          columns_preference: 10 // Default inicial
        }])
        .select()
        .single();

      if (raffleError) throw raffleError;

      const universe: number[] = [];
      const start = isPowerOf10 ? 0 : 1;
      const end = isPowerOf10 ? totalUniverse - 1 : totalUniverse;
      for (let i = start; i <= end; i++) universe.push(i);

      let mainNumberInts: number[] = [];
      let extraPool: number[] = [];

      if (data.opportunities === 1) {
          mainNumberInts = [...universe];
      } else {
          for(let i = 1; i <= data.totalTickets; i++) mainNumberInts.push(i);
          for (const u of universe) {
              if (!mainNumberInts.includes(u)) extraPool.push(u);
          }
      }

      if (data.distribution === 'aleatoria') {
          for (let i = extraPool.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [extraPool[i], extraPool[j]] = [extraPool[j], extraPool[i]];
          }
      }

      const ticketsToInsert = [];
      for (let index = 0; index < mainNumberInts.length; index++) {
          const mInt = mainNumberInts[index];
          const mStr = formatNum(mInt);
          const extraNumbers: string[] = [];

          if (data.opportunities > 1) {
              if (data.distribution === 'aleatoria') {
                  for (let k = 1; k < data.opportunities; k++) {
                     const extraInt = extraPool.pop();
                     if (extraInt !== undefined) extraNumbers.push(formatNum(extraInt));
                  }
              } else {
                  for (let k = 1; k < data.opportunities; k++) {
                     let extraInt = mInt + k * data.totalTickets;
                     if (isPowerOf10) extraInt = extraInt % totalUniverse;
                     extraNumbers.push(formatNum(extraInt));
                  }
              }
          }

          ticketsToInsert.push({
              raffle_id: newRaffleData.id,
              number: mStr,
              status: 'available',
              extra_numbers: extraNumbers
          });
      }

      const batchSize = 300;
      for (let i = 0; i < ticketsToInsert.length; i += batchSize) {
        const batch = ticketsToInsert.slice(i, i + batchSize);
        const { error: tErr } = await supabase.from('tickets').insert(batch);
        if (tErr) throw tErr;
      }

      await fetchRaffles();
    } catch (err) {
      console.error('Error creating raffle:', err);
      const errorMsg = (err as any)?.message || 'Error desconocido';
      alert(`Error al crear la rifa: ${errorMsg}`);
      throw err;
    }
  };

  const deleteRaffle = async (id: string) => {
    const { error } = await supabase.from('raffles').delete().eq('id', id);
    if (error) throw error;
    setRaffles(prev => prev.filter(r => r.id !== id));
  };

  const updateRaffle = async (id: string, updates: Partial<Raffle>) => {
    // Sincronizar preferencia de columnas y otros datos en DB
    const { error } = await supabase
      .from('raffles')
      .update({
        title: (updates as any).name || updates.title,
        description: updates.description,
        status: updates.status,
        draw_date: updates.drawDate,
        theme_color: updates.themeColor,
        columns_preference: updates.columnsPreference // Persistir preferencia
      })
      .eq('id', id);

    if (error) throw error;
    await fetchRaffles();
  };

  const updateTicket = async (raffleId: string, ticketId: string, updates: Partial<Ticket>) => {
    const { error } = await supabase
      .from('tickets')
      .update({
        status: updates.status,
        owner_name: updates.ownerName,
        owner_phone: updates.ownerPhone,
        paid_at: updates.paidAt
      })
      .eq('raffle_id', raffleId)
      .eq('number', ticketId);

    if (error) throw error;
    await fetchRaffles();
  };

  const getRaffle = (id: string) => raffles.find(r => r.id === id);

  return (
    <RaffleContext.Provider value={{ 
      raffles, 
      loading, 
      createRaffle, 
      deleteRaffle, 
      updateTicket, 
      updateRaffle, 
      getRaffle,
      refreshRaffles: fetchRaffles
    }}>
      {children}
    </RaffleContext.Provider>
  );
}

export const useRaffles = () => {
  const context = useContext(RaffleContext);
  if (!context) throw new Error('useRaffles must be used within RaffleProvider');
  return context;
};
