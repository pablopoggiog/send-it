import { createConfig, http } from "wagmi";
import { avalancheFuji } from "wagmi/chains";
import { injected } from "wagmi/connectors";

export const config = createConfig({
  chains: [avalancheFuji],
  connectors: [
    injected({
      shimDisconnect: true
    })
  ],
  transports: {
    [avalancheFuji.id]: http()
  },
  multiInjectedProviderDiscovery: false,
  ssr: false
});
