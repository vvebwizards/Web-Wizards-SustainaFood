import React, { createContext, useContext } from "react";

export const appTheme = {
    colors: {
      primary: "#4caf50",
      secondary: "#a8e6cf",
      background: "#e8f5e9",
      text: "#2e7d32",
    },
    prizes: [
      { label: "❌", points: 0 },
      { label: "100pt", points: 100 },
      { label: "❌", points: 0 },
      { label: "1000pt", points: 1000 },
      { label: "10000pt", points: 10000 },
      { label: "❌", points: 0 },
      { label: "10pt", points: 10 },
      { label: "💎 Jackpot", points: 1000000 },
    ],
  };

const ThemeContext = createContext(appTheme);
export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => (
  <ThemeContext.Provider value={appTheme}>{children}</ThemeContext.Provider>
);
