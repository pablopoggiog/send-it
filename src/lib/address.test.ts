import { describe, expect, it } from "vitest";
import { truncateAddress } from "./address";

describe("truncateAddress", () => {
  it("should truncate a valid Ethereum address", () => {
    const address = "0x1234567890123456789012345678901234567890" as const;
    const result = truncateAddress(address);
    expect(result).toBe("0x12...7890");
  });

  it("should handle different address lengths", () => {
    const address = "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd" as const;
    const result = truncateAddress(address);
    expect(result).toBe("0xab...abcd");
  });

  it("should maintain the 0x prefix and last 4 characters", () => {
    const address = "0x0000000000000000000000000000000000000001" as const;
    const result = truncateAddress(address);
    expect(result).toBe("0x00...0001");
  });
});
