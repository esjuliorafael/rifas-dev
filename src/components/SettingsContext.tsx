import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

export interface Settings {
  logoUrl: string | null;
  paymentName: string;
  paymentBank: string;
  paymentClabe: string;
  paymentCard: string;
  paymentPhone: string;
  paymentAlias: string;
}

interface SettingsContextType {
  settings: Settings;
  loading: boolean;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const defaultSettings: Settings = {
  logoUrl: null,
  paymentName: '',
  paymentBank: '',
  paymentClabe: '',
  paymentCard: '',
  paymentPhone: '',
  paymentAlias: ''
};

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows found"
        throw error;
      }

      if (data) {
        setSettings({
          logoUrl: data.logo_url,
          paymentName: data.payment_name || '',
          paymentBank: data.payment_bank || '',
          paymentClabe: data.payment_clabe || '',
          paymentCard: data.payment_card || '',
          paymentPhone: data.payment_phone || '',
          paymentAlias: data.payment_alias || ''
        });
      } else {
        // If no settings exist, try to initialize with default or localStorage migration
        const stored = localStorage.getItem('rifas-pro-settings');
        if (stored) {
          const parsed = JSON.parse(stored);
          const initialSettings = { ...defaultSettings, ...parsed };
          await updateSettings(initialSettings);
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSettings = async (newSettings: Partial<Settings>) => {
    const updated = { ...settings, ...newSettings };
    
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({
          id: 1,
          logo_url: updated.logoUrl,
          payment_name: updated.paymentName,
          payment_bank: updated.paymentBank,
          payment_clabe: updated.paymentClabe,
          payment_card: updated.paymentCard,
          payment_phone: updated.paymentPhone,
          payment_alias: updated.paymentAlias
        });

      if (error) throw error;
      setSettings(updated);
      // Keep localStorage as backup/sync for immediate UI response if needed
      localStorage.setItem('rifas-pro-settings', JSON.stringify(updated));
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, updateSettings, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
