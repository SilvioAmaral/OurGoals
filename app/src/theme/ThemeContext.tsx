import React, { createContext, useContext } from 'react';
import { THEMES, ThemeName } from './colors';
import { useAppStore } from '../store/appStore';

const ThemeContext = createContext(THEMES.purple);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useAppStore(s => s.theme);
  return (
    <ThemeContext.Provider value={THEMES[theme]}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
