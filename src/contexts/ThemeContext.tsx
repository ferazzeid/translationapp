import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeName = 'corporate' | 'minimalist' | 'violet-material';

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
  // Always enable themes
  const enableThemes = true;
  
  const [theme, setThemeState] = useState<ThemeName>(() => {
    const saved = localStorage.getItem('ui.theme');
    return (saved as ThemeName) || 'corporate';
  });

  const setTheme = (newTheme: ThemeName) => {
    setThemeState(newTheme);
    localStorage.setItem('ui.theme', newTheme);
    
    // Log theme change for analytics
    console.log('Theme changed:', { 
      theme: newTheme, 
      timestamp: new Date().toISOString() 
    });
  };

  useEffect(() => {
    // Always set theme attribute
    document.documentElement.dataset.theme = theme;
  }, [theme]);

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