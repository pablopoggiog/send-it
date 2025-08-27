import { describe, expect, it } from 'vitest';
import { truncateAddress } from './address';
import { USDC_TOKEN_ADDRESS } from './usdc';

describe('truncateAddress', () => {
  it('removes the middle of the address', () => {
    const result = truncateAddress(USDC_TOKEN_ADDRESS);
    expect(result).toBe('0x54...Bc65');
  });
});
