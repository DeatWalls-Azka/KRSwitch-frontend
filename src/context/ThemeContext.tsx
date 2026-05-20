import React, { createContext, useContext, useEffect, useState } from 'react';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('krswitch-theme');
    return saved === 'dark'; // default to light if not found
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('theme-switching');
    
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('krswitch-theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('krswitch-theme', 'light');
    }

    const t = setTimeout(() => root.classList.remove('theme-switching'), 50);
    return () => clearTimeout(t);
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
