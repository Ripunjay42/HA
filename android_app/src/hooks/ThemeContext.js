import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { colorScheme as nativewindColorScheme } from 'nativewind';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'has_theme_preference';
const ThemeContext = createContext(null);

// preference is 'light' | 'dark' | 'system'. When 'system', the resolved
// scheme follows the OS setting via useColorScheme(); otherwise it's pinned
// to whatever the user picked, persisted across app restarts.
export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [preference, setPreference] = useState('system');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) setPreference(stored);
      } catch (err) {
        // fall back to 'system' if storage is unreadable
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const setThemePreference = async (next) => {
    setPreference(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, next);
    } catch (err) {
      // non-fatal -- preference just won't persist this session
    }
  };

  const resolvedScheme = preference === 'system' ? (systemScheme || 'light') : preference;

  // NativeWind's `dark:`/CSS-variable styling is driven by its own internal
  // colorScheme observable (react-native-css-interop), completely separate
  // from React Native's Appearance API. Without this, the JS-side colors()
  // hook and NativeWind's className-driven colors can disagree -- e.g. one
  // half of a screen going dark while text colors stay light, or vice versa.
  useEffect(() => {
    nativewindColorScheme.set(resolvedScheme);
  }, [resolvedScheme]);

  const value = useMemo(
    () => ({ preference, resolvedScheme, setThemePreference, loaded }),
    [preference, resolvedScheme, loaded],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
