

import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { Theme, ThemeStyles } from '../types';
import { DEFAULT_THEMES, DEFAULT_THEME_ID } from '../themes';

// Define the shape of the context value
interface ThemesContextType {
  themes: Theme[];
  getThemeById: (id: string | null | undefined) => Theme;
  addTheme: (name: string, styles: ThemeStyles) => Theme;
  updateTheme: (updatedTheme: Theme) => void;
  deleteTheme: (id: string) => void;
}

// Create the context with a default undefined value to enforce provider usage
const ThemesContext = createContext<ThemesContextType | undefined>(undefined);

// Internal hook containing the actual state logic
const useThemesLogic = (): ThemesContextType => {
  const [customThemes, setCustomThemes] = useLocalStorage<Theme[]>('customThemes', []);

  const themes = useMemo(() => [...DEFAULT_THEMES, ...customThemes], [customThemes]);

  const getThemeById = useCallback((id: string | null | undefined): Theme => {
    return themes.find(t => t.id === id) || themes.find(t => t.id === DEFAULT_THEME_ID)!;
  }, [themes]);

  const addTheme = (name: string, styles: ThemeStyles): Theme => {
    const newTheme: Theme = {
      id: `custom-${Date.now()}`,
      name,
      styles,
      isCustom: true,
    };
    setCustomThemes(prev => [...prev, newTheme]);
    return newTheme;
  };

  const updateTheme = (updatedTheme: Theme) => {
    if (!updatedTheme.isCustom) return; // Cannot update default themes
    setCustomThemes(prev => prev.map(t => t.id === updatedTheme.id ? updatedTheme : t));
  };

  const deleteTheme = (id: string) => {
    setCustomThemes(prev => prev.filter(t => t.id !== id));
  };

  return { themes, getThemeById, addTheme, updateTheme, deleteTheme };
};

// The provider component that will wrap the application
export const ThemesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const themesLogic = useThemesLogic();
    // Fix: Rewrote JSX to React.createElement to be compatible with a .ts file. The file contained JSX, which requires a .tsx file extension.
    return React.createElement(ThemesContext.Provider, { value: themesLogic }, children);
};

// The public hook that components will use to access the theme context
export const useThemes = (): ThemesContextType => {
    const context = useContext(ThemesContext);
    if (context === undefined) {
        throw new Error('useThemes must be used within a ThemesProvider');
    }
    return context;
};
