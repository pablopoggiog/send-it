import type { Address } from 'viem';

export const truncateAddress = (address: Address): string => {
  return `${address.slice(0, 4)}...${address.slice(38)}`;
};
