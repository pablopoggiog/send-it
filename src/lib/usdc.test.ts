import { describe, expect, it } from "vitest";
import {
  formatUsdc,
  parseUsdc,
  USDC_DECIMALS,
  USDC_TOKEN_ADDRESS
} from "./usdc";

describe("USDC utilities", () => {
  describe("formatUsdc", () => {
    it("should format USDC from wei to human readable format", () => {
      const weiAmount = 1000000n; // 1 USDC (6 decimals)
      const result = formatUsdc(weiAmount);
      expect(result).toBe("1");
    });

    it("should handle zero amount", () => {
      const weiAmount = 0n;
      const result = formatUsdc(weiAmount);
      expect(result).toBe("0");
    });

    it("should handle fractional amounts", () => {
      const weiAmount = 123456n; // 0.123456 USDC
      const result = formatUsdc(weiAmount);
      expect(result).toBe("0.123456");
    });

    it("should handle large amounts", () => {
      const weiAmount = 1000000000000n; // 1,000,000 USDC
      const result = formatUsdc(weiAmount);
      expect(result).toBe("1000000");
    });
  });

  describe("parseUsdc", () => {
    it("should parse USDC from human readable format to wei", () => {
      const usdcAmount = "1.0";
      const result = parseUsdc(usdcAmount);
      expect(result).toBe(1000000n);
    });

    it("should handle zero amount", () => {
      const usdcAmount = "0";
      const result = parseUsdc(usdcAmount);
      expect(result).toBe(0n);
    });

    it("should handle fractional amounts", () => {
      const usdcAmount = "0.123456";
      const result = parseUsdc(usdcAmount);
      expect(result).toBe(123456n);
    });

    it("should handle amounts without decimal", () => {
      const usdcAmount = "100";
      const result = parseUsdc(usdcAmount);
      expect(result).toBe(100000000n);
    });

    it("should handle amounts with trailing zeros", () => {
      const usdcAmount = "1.000000";
      const result = parseUsdc(usdcAmount);
      expect(result).toBe(1000000n);
    });
  });

  describe("constants", () => {
    it("should have correct USDC token address", () => {
      expect(USDC_TOKEN_ADDRESS).toBe(
        "0x5425890298aed601595a70AB815c96711a31Bc65"
      );
    });

    it("should have correct USDC decimals", () => {
      expect(USDC_DECIMALS).toBe(6);
    });
  });

  describe("round trip conversion", () => {
    it("should maintain precision through format and parse", () => {
      const originalAmount = "123.456789";
      const parsed = parseUsdc(originalAmount);
      const formatted = formatUsdc(parsed);
      expect(formatted).toBe("123.456789");
    });

    it("should handle edge case with maximum precision", () => {
      const originalAmount = "0.000001";
      const parsed = parseUsdc(originalAmount);
      const formatted = formatUsdc(parsed);
      expect(formatted).toBe("0.000001");
    });
  });
});
