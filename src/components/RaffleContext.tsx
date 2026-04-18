import React, { createContext, useContext, useState, useEffect } from 'react';
import { Raffle, Ticket, TicketStatus } from '../types';

interface RaffleContextType {
  raffles: Raffle[];
  createRaffle: (raffle: Omit<Raffle, 'id' | 'createdAt' | 'tickets' | 'totalUniverse'>) => void;
  deleteRaffle: (id: string) => void;
  updateTicket: (raffleId: string, ticketId: string, updates: Partial<Ticket>) => void;
  updateRaffle: (raffleId: string, updates: Partial<Raffle>) => void;
  getRaffle: (id: string) => Raffle | undefined;
}

const RaffleContext = createContext<RaffleContextType | undefined>(undefined);

export function RaffleProvider({ children }: { children: React.ReactNode }) {
  const [raffles, setRaffles] = useState<Raffle[]>(() => {
    try {
      const saved = localStorage.getItem('rifas_pro_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Migrate old logic to support opportunities safely without breaking the viewer
        return parsed.map((r: any) => {
          const migratedTickets: Record<string, Ticket> = {};
          if (r.tickets) {
            for (const key in r.tickets) {
              const t = r.tickets[key];
              migratedTickets[key] = {
                ...t,
                id: t.id || t.number || key,
                numbers: t.numbers || [t.id || t.number || key]
              };
            }
          }
          return {
            ...r,
            totalUniverse: r.totalUniverse || r.totalTickets || 0,
            opportunities: r.opportunities || 1,
            distribution: r.distribution || 'lineal',
            tickets: migratedTickets
          };
        });
      }
    } catch(e) {
      console.error(e);
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('rifas_pro_data', JSON.stringify(raffles));
  }, [raffles]);

  const createRaffle = (data: Omit<Raffle, 'id' | 'createdAt' | 'tickets' | 'totalUniverse'>) => {
    const totalUniverse = data.totalTickets * data.opportunities;
    const isPowerOf10 = (totalUniverse === 10 || totalUniverse === 100 || totalUniverse === 1000 || totalUniverse === 10000);
    
    const maxNumberStr = isPowerOf10 ? (totalUniverse - 1).toString() : totalUniverse.toString();
    const padLength = Math.max(maxNumberStr.length, 2);

    const formatNum = (num: number) => num.toString().padStart(padLength, '0');

    const universe: number[] = [];
    const start = isPowerOf10 ? 0 : 1;
    const end = isPowerOf10 ? totalUniverse - 1 : totalUniverse;

    for (let i = start; i <= end; i++) {
        universe.push(i);
    }

    const newRaffle: Raffle = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      totalUniverse,
      tickets: {}
    };

    let mainNumberInts: number[] = [];
    let extraPool: number[] = [];

    if (data.opportunities === 1) {
        mainNumberInts = [...universe];
    } else {
        for(let i = 1; i <= data.totalTickets; i++) {
            mainNumberInts.push(i);
        }
        for (const u of universe) {
            if (!mainNumberInts.includes(u)) {
                extraPool.push(u);
            }
        }
    }

    if (data.distribution === 'aleatoria') {
        for (let i = extraPool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [extraPool[i], extraPool[j]] = [extraPool[j], extraPool[i]];
        }
    }

    for (let index = 0; index < mainNumberInts.length; index++) {
        const mInt = mainNumberInts[index];
        const mStr = formatNum(mInt);
        const numbers = [mStr];

        if (data.opportunities > 1) {
            if (data.distribution === 'aleatoria') {
                for (let k = 1; k < data.opportunities; k++) {
                   const extraInt = extraPool.pop();
                   if (extraInt !== undefined) numbers.push(formatNum(extraInt));
                }
            } else {
                for (let k = 1; k < data.opportunities; k++) {
                   let extraInt = mInt + k * data.totalTickets;
                   if (isPowerOf10) {
                      extraInt = extraInt % totalUniverse;
                   }
                   numbers.push(formatNum(extraInt));
                }
            }
        }

        newRaffle.tickets[mStr] = {
            id: mStr,
            numbers,
            status: 'available'
        };
    }

    setRaffles(prev => [newRaffle, ...prev]);
  };

  const deleteRaffle = (id: string) => {
    setRaffles(prev => prev.filter(r => r.id !== id));
  };

  const updateRaffle = (id: string, updates: Partial<Raffle>) => {
    setRaffles(prev => prev.map(r => {
      if (r.id !== id) return r;
      return { ...r, ...updates };
    }));
  };

  const updateTicket = (raffleId: string, ticketId: string, updates: Partial<Ticket>) => {
    setRaffles(prev => prev.map(r => {
      if (r.id !== raffleId) return r;
      return {
        ...r,
        tickets: {
          ...r.tickets,
          [ticketId]: {
             ...r.tickets[ticketId],
             ...updates
          }
        }
      };
    }));
  };

  const getRaffle = (id: string) => raffles.find(r => r.id === id);

  return (
    <RaffleContext.Provider value={{ raffles, createRaffle, deleteRaffle, updateTicket, updateRaffle, getRaffle }}>
      {children}
    </RaffleContext.Provider>
  );
}

export const useRaffles = () => {
  const context = useContext(RaffleContext);
  if (!context) throw new Error('useRaffles must be used within RaffleProvider');
  return context;
};
