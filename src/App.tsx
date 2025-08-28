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
            duration: 15000,
            style: {
              background:
                "linear-gradient(135deg, rgba(22, 22, 24, 0.95) 0%, rgba(30, 30, 32, 0.95) 100%)",
              color: "#ffffff",
              borderRadius: "12px",
              padding: "16px 20px",
              fontSize: "14px",
              fontWeight: "500",
              boxShadow:
                "0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px rgba(99, 102, 241, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              fontFamily:
                '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
              maxWidth: "400px",
              minWidth: "300px"
            },
            success: {
              duration: 10000,
              style: {
                background: "rgba(16, 185, 129, 0.1)",
                border: "1px solid rgba(16, 185, 129, 0.2)",
                boxShadow:
                  "0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px rgba(16, 185, 129, 0.1)"
              }
            },
            error: {
              duration: 15000,
              style: {
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                boxShadow:
                  "0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px rgba(239, 68, 68, 0.1)"
              }
            },
            loading: {
              duration: Number.POSITIVE_INFINITY,
              style: {
                background:
                  "linear-gradient(135deg, rgba(22, 22, 24, 0.95) 0%, rgba(30, 30, 32, 0.95) 100%)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                boxShadow:
                  "0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px rgba(99, 102, 241, 0.1)"
              }
            }
          }}
        />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
