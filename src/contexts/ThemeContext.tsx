import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeName = 'neo-light' | 'aqua-light' | 'violet-material';

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  enableThemes: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  // Check if themes are enabled via environment variable
  const enableThemes = import.meta.env.VITE_ENABLE_THEMES === 'true';
  
  const [theme, setThemeState] = useState<ThemeName>(() => {
    if (!enableThemes) return 'neo-light';
    
    const saved = localStorage.getItem('ui.theme');
    return (saved as ThemeName) || 'neo-light';
  });

  const setTheme = (newTheme: ThemeName) => {
    if (!enableThemes) return;
    
    setThemeState(newTheme);
    localStorage.setItem('ui.theme', newTheme);
    
    // Log theme change for analytics
    console.log('Theme changed:', { 
      theme: newTheme, 
      timestamp: new Date().toISOString() 
    });
  };

  useEffect(() => {
    if (enableThemes) {
      document.documentElement.dataset.theme = theme;
    } else {
      // Remove theme attribute when disabled
      delete document.documentElement.dataset.theme;
    }
  }, [theme, enableThemes]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, enableThemes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};