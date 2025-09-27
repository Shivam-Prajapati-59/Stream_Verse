"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  RainbowKitProvider,
  lightTheme,
  darkTheme,
} from "@rainbow-me/rainbowkit";

interface RainbowKitThemeProviderProps {
  children: React.ReactNode;
}

export function RainbowKitThemeProvider({
  children,
}: RainbowKitThemeProviderProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <RainbowKitProvider
        theme={lightTheme({
          accentColor: "#6366f1",
          accentColorForeground: "white",
          borderRadius: "medium",
          fontStack: "system",
        })}
        modalSize="compact"
      >
        {children}
      </RainbowKitProvider>
    );
  }

  // Use resolvedTheme to get the actual theme (light/dark/system resolved)
  const currentTheme = resolvedTheme === "dark" ? "dark" : "light";

  const rainbowKitTheme =
    currentTheme === "dark"
      ? darkTheme({
          accentColor: "#6366f1",
          accentColorForeground: "white",
          borderRadius: "medium",
          fontStack: "system",
        })
      : lightTheme({
          accentColor: "#6366f1",
          accentColorForeground: "white",
          borderRadius: "medium",
          fontStack: "system",
        });

  return (
    <RainbowKitProvider theme={rainbowKitTheme} modalSize="compact">
      {children}
    </RainbowKitProvider>
  );
}
