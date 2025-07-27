// src/theme/ThemeContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';

export const lightColors = {
  background: '#FFFFFF',
  card: '#F7F9F9',
  text: '#34495E',
  placeholder: '#7F8C8D',
  border: '#D0D7DE',
  buttonBackground: '#2980B9',
  buttonText: '#FFFFFF',
  accent: '#3498DB',
  selected: '#DBEAFE',
  success: '#27AE60',
  error: '#E74C3C',
};

export const darkColors = {
  background: '#1C2833',
  card: '#212F3D',
  text: '#DCDBDD',
  placeholder: '#B2BABB',
  border: '#566573',
  buttonBackground: '#5DADE2',
  buttonText: '#1C2833',
  accent: '#5DADE2',
  selected: '#223056',
  success: '#27AE60',
  error: '#E74C3C',
};

const ThemeContext = createContext();

/**
 * ThemeProvider manages theme mode state and listens to system preference.
 * Supports "system", "light", and "dark" theme modes.
 */
export const ThemeProvider = ({ children }) => {
  // Initial theme mode is system preference
  const systemScheme = Appearance.getColorScheme() || 'light';
  // You can default to "system" or "light" here; "system" means follow device theme
  const [themeMode, setThemeMode] = useState('system'); // 'system' | 'light' | 'dark'

  // Listen to system color scheme changes to update if theme is "system"
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (themeMode === 'system') {
        setThemeMode('system'); // triggers re-render so colors update
      }
    });
    return () => subscription.remove();
  }, [themeMode]);

  // Derived effective theme based on themeMode and systemScheme
  const theme = themeMode === 'system' ? systemScheme : themeMode;

  // Pick palette
  const colors = theme === 'dark' ? darkColors : lightColors;

  // Toggle function to switch light/dark manually
  const toggleTheme = () => {
    if (themeMode === 'light') {
      setThemeMode('dark');
    } else if (themeMode === 'dark') {
      setThemeMode('light');
    } else {
      // If system, default to dark first
      setThemeMode('dark');
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        setTheme: setThemeMode,
        toggleTheme,
        colors,
        theme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to get colors palette and current theme string ("light" or "dark")
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return {
    colors: context.colors,
    theme: context.theme,
  };
};

/**
 * Hook to get and set theme mode programmatically.
 * `themeMode` can be "system", "light", or "dark".
 */
export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeProvider');
  }
  return {
    themeMode: context.themeMode,
    setTheme: context.setTheme,
    toggleTheme: context.toggleTheme,
  };
};
