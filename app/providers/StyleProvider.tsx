"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface StyleProviderProps {
  children: React.ReactNode;
}

interface StyleContextType {
  textSize: "small" | "medium" | "large";
  animations: boolean;
  setTextSize: (size: "small" | "medium" | "large") => void;
  setAnimations: (enabled: boolean) => void;
}

const StyleContext = createContext<StyleContextType | undefined>(undefined);

const textSizeClasses = {
  small: "text-sm",
  medium: "text-base",
  large: "text-lg",
};

export function StyleProvider({ children }: StyleProviderProps) {
  const [textSize, setTextSize] = useState<"small" | "medium" | "large">(
    "medium"
  );
  const [animations, setAnimations] = useState(true);

  useEffect(() => {
    const root = window.document.documentElement;

    // Apply text size
    Object.values(textSizeClasses).forEach((className) => {
      root.classList.remove(className);
    });
    root.classList.add(textSizeClasses[textSize]);

    // Apply animations
    root.style.setProperty("--animate", animations ? "1" : "0");
  }, [textSize, animations]);

  return (
    <StyleContext.Provider
      value={{ textSize, setTextSize, animations, setAnimations }}
    >
      {children}
    </StyleContext.Provider>
  );
}

export const useStyle = () => {
  const context = useContext(StyleContext);
  if (context === undefined) {
    throw new Error("useStyle must be used within a StyleProvider");
  }
  return context;
};
