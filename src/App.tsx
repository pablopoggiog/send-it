import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { SendTokens } from "./components/SendTokens.tsx";
import { config } from "./lib/wagmiConfig.ts";

const queryClient = new QueryClient();

export function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <SendTokens />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
