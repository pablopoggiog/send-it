import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { WagmiProvider } from "wagmi";
import { SendTokens } from "./components/SendTokens.tsx";
import { config } from "./lib/wagmiConfig.ts";

const queryClient = new QueryClient();

export function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <SendTokens />
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#363636",
              color: "#fff",
              borderRadius: "12px",
              padding: "16px",
              fontSize: "14px",
              fontWeight: "500",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
              border: "1px solid rgba(255, 255, 255, 0.1)"
            },
            success: {
              style: {
                background: "#10b981",
                border: "1px solid #059669"
              }
            },
            error: {
              style: {
                background: "#ef4444",
                border: "1px solid #dc2626"
              }
            },
            loading: {
              style: {
                background: "#3b82f6",
                border: "1px solid #2563eb"
              }
            }
          }}
        />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
