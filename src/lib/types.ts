// Wallet provider types
export interface WalletProvider {
  isCore?: boolean;
  isAvalanche?: boolean;
  isMetaMask?: boolean;
  isWalletConnect?: boolean;
  [key: string]: unknown;
}

// Extended window interface for ethereum
export interface ExtendedWindow extends Window {
  ethereum?: {
    isCore?: boolean;
    isAvalanche?: boolean;
    isMetaMask?: boolean;
    providers?: WalletProvider[];
    request?: (args: {
      method: string;
      params?: unknown[];
    }) => Promise<unknown>;
    on?: (event: string, callback: (...args: unknown[]) => void) => void;
    removeListener?: (
      event: string,
      callback: (...args: unknown[]) => void
    ) => void;
  };
}

// Type guard for ethereum object
export const hasEthereum = (window: Window): window is ExtendedWindow => {
  return "ethereum" in window;
};

// Form data types
export interface SendTokensFormData {
  recipient: string;
  amount: string;
  selectedPercentage: number | null;
}

export interface FormErrors {
  recipient: string;
  amount: string;
}

// Transaction state types
export interface TransactionState {
  isSubmitting: boolean;
  isPending: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  error: Error | null;
  hash: `0x${string}` | undefined;
}

// Utility type for ensuring address format
export type HexAddress = `0x${string}`;

// Type guard for checking if a string is a valid hex address
export const isHexAddress = (value: string): value is HexAddress => {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
};
