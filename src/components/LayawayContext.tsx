import React, { createContext, useContext, useState, useEffect } from 'react';
import { Layaway, LayawayParticipant } from '../types';
import { supabase } from '../utils/supabase';

interface LayawayContextType {
  layaways: Layaway[];
  loading: boolean;
  createLayaway: (layaway: Omit<Layaway, 'id' | 'createdAt' | 'participants'>) => Promise<void>;
  deleteLayaway: (id: string) => Promise<void>;
  updateParticipant: (layawayId: string, participantId: string, updates: Partial<LayawayParticipant>) => Promise<void>;
  updateLayaway: (layawayId: string, updates: Partial<Layaway>) => Promise<void>;
  getLayaway: (id: string) => Layaway | undefined;
  refreshLayaways: () => Promise<void>;
}

const LayawayContext = createContext<LayawayContextType | undefined>(undefined);

export function LayawayProvider({ children }: { children: React.ReactNode }) {
  const [layaways, setLayaways] = useState<Layaway[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLayaways = async () => {
    try {
      setLoading(true);
      const { data: layawaysData, error: layawaysError } = await supabase
        .from('layaways')
        .select('*')
        .order('created_at', { ascending: false });

      if (layawaysError) throw layawaysError;

      const fullLayaways: Layaway[] = (layawaysData || []).map(l => ({
        id: l.id,
        createdAt: l.created_at,
        title: l.title,
        totalAmount: Number(l.total_amount),
        numberOfPayments: l.number_of_payments,
        frequency: l.frequency,
        status: l.status,
        participants: {} // For now, logic simplified as tickets
      }));

      setLayaways(fullLayaways);
    } catch (error) {
      console.error('Error fetching layaways:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLayaways();
  }, []);

  const createLayaway = async (layawayData: Omit<Layaway, 'id' | 'createdAt' | 'participants'>) => {
    const { error } = await supabase
      .from('layaways')
      .insert([{
        title: layawayData.title,
        total_amount: layawayData.totalAmount,
        number_of_payments: layawayData.numberOfPayments,
        frequency: layawayData.frequency
      }]);

    if (error) throw error;
    await fetchLayaways();
  };

  const deleteLayaway = async (id: string) => {
    const { error } = await supabase.from('layaways').delete().eq('id', id);
    if (error) throw error;
    setLayaways(prev => prev.filter(t => t.id !== id));
  };

  const updateLayaway = async (id: string, updates: Partial<Layaway>) => {
    const { error } = await supabase
      .from('layaways')
      .update({
        title: updates.title,
        status: updates.status
      })
      .eq('id', id);

    if (error) throw error;
    await fetchLayaways();
  };

  const updateParticipant = async (layawayId: string, participantId: string, updates: Partial<LayawayParticipant>) => {
    // Participant logic would require its own table if we want full persistence
    // For now, updating state locally to avoid breaking UI, but DB needs another table
    console.warn('Participant update to DB not fully implemented - needs participants table');
  };

  const getLayaway = (id: string) => layaways.find(t => t.id === id);

  return (
    <LayawayContext.Provider value={{ 
      layaways, 
      loading, 
      createLayaway, 
      deleteLayaway, 
      updateParticipant, 
      updateLayaway, 
      getLayaway,
      refreshLayaways: fetchLayaways
    }}>
      {children}
    </LayawayContext.Provider>
  );
}

export const useLayaways = () => {
  const context = useContext(LayawayContext);
  if (context === undefined) throw new Error('useLayaways must be used within LayawayProvider');
  return context;
};
