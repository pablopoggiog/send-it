import { erc20Abi, type Address } from 'viem';

/**
 * The address on Fuji where the USDC contract is deployed.
 * @see https://subnets-test.avax.network/c-chain/token/0x5425890298aed601595a70AB815c96711a31Bc65
 */
export const USDC_TOKEN_ADDRESS: Address = '0x5425890298aed601595a70AB815c96711a31Bc65' as const;
/**
 * The interface of the USDC contract.
 * This is necessary for interacting with this contract on chain.
 * @see https://ethereum.org/en/developers/docs/standards/tokens/erc-20/
 * @see https://viem.sh/docs/glossary/types#abi
 */
export const USDC_TOKEN_ABI = erc20Abi;
