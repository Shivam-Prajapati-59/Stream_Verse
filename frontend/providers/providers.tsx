"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import {
  mainnet,
  polygon,
  base,
  filecoin,
  filecoinCalibration,
  polygonAmoy,
} from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ThemeProvider } from "@/providers/theme-provider";
import { RainbowKitThemeProvider } from "./rainbow-kit-theme-provider";
import { SynapseProvider } from "./synapseprovider";
import { ConfettiProvider } from "./ConfettiProvider";

const config = getDefaultConfig({
  appName: "Stream Verse",
  projectId: "d374afc87d0ed38c3e12eecb5ba28beb",
  chains: [mainnet, polygon, filecoin, filecoinCalibration, polygonAmoy, base],
  ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <RainbowKitThemeProvider>
            <SynapseProvider>
              <ConfettiProvider>{children}</ConfettiProvider>
            </SynapseProvider>
          </RainbowKitThemeProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
