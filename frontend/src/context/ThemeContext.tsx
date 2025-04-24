import React, { createContext, useContext } from "react";

export const appTheme = {
  colors: {
    primary: "#4caf50", // sustainable green
    secondary: "#a8e6cf",
    background: "#e8f5e9",
    text: "#2e7d32",
  },
  prizes: [
    "1000000pt",
    "100000pt",
    "❌ ",
    "10pt ",
    "❌ ",
    "100pt",
    "❌ ",
    "1000pt"
  ]
};

const ThemeContext = createContext(appTheme);
export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => (
  <ThemeContext.Provider value={appTheme}>{children}</ThemeContext.Provider>
);
