import React, { createContext, useContext, useState, useEffect } from 'react';
import { Tanda, TandaParticipant } from '../types';

interface TandaContextType {
  tandas: Tanda[];
  createTanda: (tanda: Omit<Tanda, 'id' | 'createdAt' | 'participants'>) => void;
  deleteTanda: (id: string) => void;
  updateParticipant: (tandaId: string, participantId: string, updates: Partial<TandaParticipant>) => void;
  updateTanda: (tandaId: string, updates: Partial<Tanda>) => void;
  getTanda: (id: string) => Tanda | undefined;
}

const TandaContext = createContext<TandaContextType | undefined>(undefined);

export function TandaProvider({ children }: { children: React.ReactNode }) {
  const [tandas, setTandas] = useState<Tanda[]>(() => {
    try {
      const saved = localStorage.getItem('rifas_pro_tandas');
      if (saved) return JSON.parse(saved);
    } catch(e) {
      console.error(e);
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('rifas_pro_tandas', JSON.stringify(tandas));
  }, [tandas]);

  const createTanda = (tandaData: Omit<Tanda, 'id' | 'createdAt' | 'participants'>) => {
    const participants: Record<string, TandaParticipant> = {};
    for (let i = 1; i <= tandaData.numberOfParticipants; i++) {
       const pId = String(i);
       participants[pId] = {
         id: pId,
         name: '',
         phone: '',
         status: 'available',
         payments: Array(tandaData.numberOfWeeks).fill(null)
       };
    }
    
    const newTanda: Tanda = {
      ...tandaData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      participants
    };
    
    setTandas(prev => [...prev, newTanda]);
  };

  const deleteTanda = (id: string) => {
    setTandas(prev => prev.filter(t => t.id !== id));
  };

  const updateTanda = (id: string, updates: Partial<Tanda>) => {
    setTandas(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const updateParticipant = (tandaId: string, participantId: string, updates: Partial<TandaParticipant>) => {
    setTandas(prev => prev.map(t => {
      if (t.id !== tandaId) return t;
      return {
        ...t,
        participants: {
          ...t.participants,
          [participantId]: {
            ...t.participants[participantId],
            ...updates
          }
        }
      };
    }));
  };

  const getTanda = (id: string) => tandas.find(t => t.id === id);

  return (
    <TandaContext.Provider value={{ tandas, createTanda, deleteTanda, updateParticipant, updateTanda, getTanda }}>
      {children}
    </TandaContext.Provider>
  );
}

export const useTandas = () => {
  const context = useContext(TandaContext);
  if (context === undefined) throw new Error('useTandas must be used within TandaProvider');
  return context;
};
