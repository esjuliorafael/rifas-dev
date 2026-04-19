import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Settings {
  logoUrl: string | null;
  paymentName?: string;
  paymentBank?: string;
  paymentClabe?: string;
  paymentCard?: string;
  paymentPhone?: string;
  paymentAlias?: string;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const SETTINGS_STORAGE_KEY = 'rifas-pro-settings';

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
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) return { ...defaultSettings, ...JSON.parse(stored) };
    } catch (e) {
      console.warn("Failed to load settings", e);
    }
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
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
