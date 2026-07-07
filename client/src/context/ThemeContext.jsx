import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('cognicare_theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [mode, setMode] = useState(() => {
    return localStorage.getItem('cognicare_mode') || 'caregiver';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('cognicare_theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-mode', mode);
    localStorage.setItem('cognicare_mode', mode);
  }, [mode]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setPatientMode = () => setMode('patient');
  const setCaregiverMode = () => setMode('caregiver');

  return (
    <ThemeContext.Provider
      value={{
        theme,
        mode,
        toggleTheme,
        setPatientMode,
        setCaregiverMode,
        setMode,
        isDark: theme === 'dark',
        isPatientMode: mode === 'patient',
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
