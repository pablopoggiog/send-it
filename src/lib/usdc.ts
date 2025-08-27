import { erc20Abi, formatUnits, parseUnits, type Address } from "viem";

/**
 * The address on Fuji where the USDC contract is deployed.
 * @see https://subnets-test.avax.network/c-chain/token/0x5425890298aed601595a70AB815c96711a31Bc65
 */
export const USDC_TOKEN_ADDRESS: Address =
  "0x5425890298aed601595a70AB815c96711a31Bc65" as const;

/**
 * USDC has 6 decimal places (not 18 like most ERC-20 tokens)
 */
export const USDC_DECIMALS = 6;

/**
 * The interface of the USDC contract.
 * This is necessary for interacting with this contract on chain.
 * @see https://ethereum.org/en/developers/docs/standards/tokens/erc-20/
 * @see https://viem.sh/docs/glossary/types#abi
 */
export const USDC_TOKEN_ABI = erc20Abi;

/**
 * Format USDC amount from wei to human readable format
 */
export const formatUsdc = (value: bigint): string => {
  return formatUnits(value, USDC_DECIMALS);
};

/**
 * Parse USDC amount from human readable format to wei
 */
export const parseUsdc = (value: string): bigint => {
  return parseUnits(value, USDC_DECIMALS);
};
