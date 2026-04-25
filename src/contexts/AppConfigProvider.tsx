/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { AppConfig } from '@/models/types';
import { DEFAULT_GRADE_RANGES } from '@/config/defaultGradeRanges';

const STORAGE_KEY = 'summerCampAppConfig';

const defaultConfig: AppConfig = {
  gradeRanges: DEFAULT_GRADE_RANGES,
  extraWeeks: [],
};

interface AppConfigContextValue {
  config: AppConfig;
  updateConfig: (config: AppConfig) => void;
}

const AppConfigContext = createContext<AppConfigContextValue | undefined>(
  undefined
);

export function AppConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<AppConfig>(defaultConfig);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AppConfig;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setConfig(parsed);
      }
    } catch {
      // Ignore parse errors, use default
    }
    setIsHydrated(true);
  }, []);

  const updateConfig = (newConfig: AppConfig) => {
    setConfig(newConfig);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
  };

  if (!isHydrated) {
    return null;
  }

  return (
    <AppConfigContext.Provider value={{ config, updateConfig }}>
      {children}
    </AppConfigContext.Provider>
  );
}

export function useAppConfig() {
  const context = useContext(AppConfigContext);
  if (!context) {
    throw new Error('useAppConfig must be used within AppConfigProvider');
  }
  return context;
}
