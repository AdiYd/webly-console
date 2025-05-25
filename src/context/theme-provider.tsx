'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import Cookies from 'js-cookie';
// Extended list of supported themes
export type Theme =
  | 'light'
  | 'dark'
  | 'cupcake'
  | 'bumblebee'
  | 'emerald'
  | 'corporate'
  | 'synthwave'
  | 'retro'
  | 'cyberpunk'
  | 'valentine'
  | 'halloween'
  | 'garden'
  | 'forest'
  | 'aqua'
  | 'lofi'
  | 'pastel'
  | 'fantasy'
  | 'wireframe'
  | 'black'
  | 'luxury'
  | 'dracula'
  | 'cmyk'
  | 'autumn'
  | 'business'
  | 'acid'
  | 'lemonade'
  | 'night'
  | 'coffee'
  | 'winter'
  | 'system';

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDarkTheme: boolean;
  isLoading: boolean;
}

const initialState: ThemeContextType = {
  theme: 'system',
  setTheme: () => null,
  isDarkTheme: false,
  isLoading: true,
};

const ThemeContext = createContext<ThemeContextType>(initialState);

// List of themes considered "dark"
export const darkThemes = [
  'dark',
  'synthwave',
  'halloween',
  'forest',
  'black',
  'luxury',
  'dracula',
  'business',
  'night',
  'coffee',
];

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize theme from cookies or localStorage
  useEffect(() => {
    const savedTheme = Cookies.get(storageKey) as Theme | undefined;

    const localTheme = localStorage.getItem(storageKey) as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (localTheme) {
      setTheme(localTheme);
      Cookies.set(storageKey, localTheme, { expires: 365 });
    }
    setIsLoading(false);
  }, [storageKey]);

  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'autumn';

      root.setAttribute('data-theme', systemTheme);
      setIsDarkTheme(systemTheme === 'dark');
      return;
    }

    root.setAttribute('data-theme', theme);
    setIsDarkTheme(darkThemes.includes(theme));
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      setTheme: (newTheme: Theme) => {
        Cookies.set(storageKey, newTheme, { expires: 365 });
        localStorage.setItem(storageKey, newTheme);
        setTheme(newTheme);
      },
      isLoading,
      isDarkTheme,
    }),
    [theme, isLoading, storageKey, isDarkTheme]
  );

  return (
    <ThemeContext.Provider {...props} value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};
