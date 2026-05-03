import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const THEME_KEY = "habitspark_theme";
type ThemePref = "light" | "dark" | "system";

interface ThemeContextType {
  isDark: boolean;
  themePreference: ThemePref;
  setThemePreference: (pref: ThemePref) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  themePreference: "system",
  setThemePreference: async () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreference] = useState<ThemePref>("system");

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY)
      .then((val) => {
        if (val === "light" || val === "dark" || val === "system") {
          setPreference(val);
        }
      })
      .catch(() => {});
  }, []);

  const setThemePreference = async (pref: ThemePref) => {
    setPreference(pref);
    await AsyncStorage.setItem(THEME_KEY, pref).catch(() => {});
  };

  const isDark =
    preference === "dark" ||
    (preference === "system" && systemScheme === "dark");

  return (
    <ThemeContext.Provider
      value={{ isDark, themePreference: preference, setThemePreference }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
