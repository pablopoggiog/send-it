import type { Address } from "viem";

export const truncateAddress = (address: Address): string => {
  return `${address.slice(0, 4)}...${address.slice(38)}`;
};

// Type guard to ensure we have a valid address
export const isValidAddress = (
  address: string | undefined
): address is Address => {
  return (
    typeof address === "string" &&
    address.startsWith("0x") &&
    address.length === 42
  );
};
