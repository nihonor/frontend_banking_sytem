"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";
type ColorScheme = "blue" | "green" | "purple";

interface ThemeProviderProps {
  children: React.ReactNode;
}

interface ThemeContextType {
  theme: Theme;
  colorScheme: ColorScheme;
  setTheme: (theme: Theme) => void;
  setColorScheme: (colorScheme: ColorScheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [colorScheme, setColorScheme] = useState<ColorScheme>("blue");

  useEffect(() => {
    // Get system preference
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";

    // Apply theme
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    const themeToApply = theme === "system" ? systemTheme : theme;
    root.classList.add(themeToApply);

    // Apply color scheme
    root.classList.remove("theme-blue", "theme-green", "theme-purple");
    root.classList.add(`theme-${colorScheme}`);

    // Store preferences
    localStorage.setItem("theme", theme);
    localStorage.setItem("colorScheme", colorScheme);
  }, [theme, colorScheme]);

  // Load saved preferences on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme;
    const savedColorScheme = localStorage.getItem("colorScheme") as ColorScheme;

    if (savedTheme) setTheme(savedTheme);
    if (savedColorScheme) setColorScheme(savedColorScheme);
  }, []);

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, colorScheme, setColorScheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
