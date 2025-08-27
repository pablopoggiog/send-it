import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { config } from './lib/wagmiConfig.ts';
import { Connect } from './components/Connect.tsx';

const queryClient = new QueryClient();

export function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Connect />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
