"use client";

import { createThirdwebClient } from "thirdweb";
import { ThirdwebProvider } from "thirdweb/react";
import { ReactNode, createContext, useContext } from "react";

const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "your-client-id",
});

const ThirdwebClientContext = createContext(client);

export function useThirdwebClient() {
  return useContext(ThirdwebClientContext);
}

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThirdwebClientContext.Provider value={client}>
      <ThirdwebProvider>{children}</ThirdwebProvider>
    </ThirdwebClientContext.Provider>
  );
}
