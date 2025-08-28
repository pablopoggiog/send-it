import type { WalletProvider } from "./types";

// Mock window.ethereum interface
export interface MockEthereum {
  isCore?: boolean;
  isAvalanche?: boolean;
  isMetaMask?: boolean;
  providers?: WalletProvider[];
  request?: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, callback: (...args: unknown[]) => void) => void;
  removeListener?: (
    event: string,
    callback: (...args: unknown[]) => void
  ) => void;
}
