import React, { createContext, useContext, useState, useEffect } from 'react';
import { Raffle, Ticket } from '../types';
import { supabase } from '../utils/supabase';

interface RaffleContextType {
  raffles: Raffle[];
  loading: boolean;
  createRaffle: (raffle: Omit<Raffle, 'id' | 'createdAt' | 'tickets' | 'totalUniverse'>) => Promise<void>;
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

      const fullRaffles: Raffle[] = await Promise.all((rafflesData || []).map(async (r) => {
        const { data: ticketsData, error: ticketsError } = await supabase
          .from('tickets')
          .select('*')
          .eq('raffle_id', r.id);

        if (ticketsError) throw ticketsError;

        const ticketsMap: Record<string, Ticket> = {};
        (ticketsData || []).forEach(t => {
          // Re-calculate numbers based on logic if needed, 
          // but here we assume 'number' in DB is the ID/Main number
          // For opportunities > 1, we might need a better storage, 
          // but let's follow the existing logic for now.
          ticketsMap[t.number] = {
            id: t.number,
            status: t.status as any,
            ownerName: t.owner_name || undefined,
            ownerPhone: t.owner_phone || undefined,
            paidAt: t.paid_at || undefined,
            numbers: [t.number] // Simplified for now, will enhance
          };
        });

        return {
          id: r.id,
          title: r.title,
          description: r.description || '',
          ticketPrice: Number(r.ticket_price),
          totalTickets: r.total_tickets,
          opportunities: r.opportunities,
          distribution: r.distribution,
          createdAt: r.created_at,
          totalUniverse: r.total_tickets * r.opportunities,
          tickets: ticketsMap
        } as Raffle;
      }));

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

  const createRaffle = async (data: Omit<Raffle, 'id' | 'createdAt' | 'tickets' | 'totalUniverse'>) => {
    const totalUniverse = data.totalTickets * data.opportunities;
    const isPowerOf10 = (totalUniverse === 10 || totalUniverse === 100 || totalUniverse === 1000 || totalUniverse === 10000);
    
    const maxNumberStr = isPowerOf10 ? (totalUniverse - 1).toString() : totalUniverse.toString();
    const padLength = Math.max(maxNumberStr.length, 2);
    const formatNum = (num: number) => num.toString().padStart(padLength, '0');

    // 1. Insert Raffle
    const { data: newRaffleData, error: raffleError } = await supabase
      .from('raffles')
      .insert([{
        title: data.title,
        description: data.description,
        ticket_price: data.ticketPrice,
        total_tickets: data.totalTickets,
        opportunities: data.opportunities,
        distribution: data.distribution
      }])
      .select()
      .single();

    if (raffleError) throw raffleError;

    // 2. Generate Tickets Logic (same as before but for DB)
    const universe: number[] = [];
    const start = isPowerOf10 ? 0 : 1;
    const end = isPowerOf10 ? totalUniverse - 1 : totalUniverse;
    for (let i = start; i <= end; i++) universe.push(i);

    let mainNumberInts: number[] = [];
    if (data.opportunities === 1) {
        mainNumberInts = [...universe];
    } else {
        for(let i = 1; i <= data.totalTickets; i++) mainNumberInts.push(i);
    }

    const ticketsToInsert = mainNumberInts.map(mInt => ({
      raffle_id: newRaffleData.id,
      number: formatNum(mInt),
      status: 'available'
    }));

    // Insert in batches of 1000 to avoid limits
    const batchSize = 1000;
    for (let i = 0; i < ticketsToInsert.length; i += batchSize) {
      const batch = ticketsToInsert.slice(i, i + batchSize);
      const { error: ticketsError } = await supabase.from('tickets').insert(batch);
      if (ticketsError) throw ticketsError;
    }

    await fetchRaffles();
  };

  const deleteRaffle = async (id: string) => {
    const { error } = await supabase.from('raffles').delete().eq('id', id);
    if (error) throw error;
    setRaffles(prev => prev.filter(r => r.id !== id));
  };

  const updateRaffle = async (id: string, updates: Partial<Raffle>) => {
    const { error } = await supabase
      .from('raffles')
      .update({
        title: updates.title,
        description: updates.description,
        status: updates.status
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
