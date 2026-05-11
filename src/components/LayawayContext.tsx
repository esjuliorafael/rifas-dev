import React, { createContext, useContext, useState, useEffect } from 'react';
import { Layaway, LayawayParticipant } from '../types';

interface LayawayContextType {
  layaways: Layaway[];
  createLayaway: (layaway: Omit<Layaway, 'id' | 'createdAt' | 'participants'>) => void;
  deleteLayaway: (id: string) => void;
  updateParticipant: (layawayId: string, participantId: string, updates: Partial<LayawayParticipant>) => void;
  updateLayaway: (layawayId: string, updates: Partial<Layaway>) => void;
  getLayaway: (id: string) => Layaway | undefined;
}

const LayawayContext = createContext<LayawayContextType | undefined>(undefined);

export function LayawayProvider({ children }: { children: React.ReactNode }) {
  const [layaways, setLayaways] = useState<Layaway[]>(() => {
    try {
      const saved = localStorage.getItem('rifas_pro_tandas');
      if (saved) return JSON.parse(saved);
    } catch(e) {
      console.error(e);
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('rifas_pro_tandas', JSON.stringify(layaways));
  }, [layaways]);

  const createLayaway = (layawayData: Omit<Layaway, 'id' | 'createdAt' | 'participants'>) => {
    const participants: Record<string, LayawayParticipant> = {};
    for (let i = 1; i <= layawayData.numberOfParticipants; i++) {
       const pId = String(i);
       participants[pId] = {
         id: pId,
         name: '',
         phone: '',
         status: 'available',
         payments: Array(layawayData.numberOfWeeks).fill(null)
       };
    }
    
    const newLayaway: Layaway = {
      ...layawayData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      participants
    };
    
    setLayaways(prev => [...prev, newLayaway]);
  };

  const deleteLayaway = (id: string) => {
    setLayaways(prev => prev.filter(t => t.id !== id));
  };

  const updateLayaway = (id: string, updates: Partial<Layaway>) => {
    setLayaways(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const updateParticipant = (layawayId: string, participantId: string, updates: Partial<LayawayParticipant>) => {
    setLayaways(prev => prev.map(t => {
      if (t.id !== layawayId) return t;
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

  const getLayaway = (id: string) => layaways.find(t => t.id === id);

  return (
    <LayawayContext.Provider value={{ layaways, createLayaway, deleteLayaway, updateParticipant, updateLayaway, getLayaway }}>
      {children}
    </LayawayContext.Provider>
  );
}

export const useLayaways = () => {
  const context = useContext(LayawayContext);
  if (context === undefined) throw new Error('useLayaways must be used within LayawayProvider');
  return context;
};
