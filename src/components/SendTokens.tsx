import { useEffect, useState } from "react";
import { isAddress } from "viem";
import {
  useAccount,
  useBalance,
  useWaitForTransactionReceipt,
  useWriteContract
} from "wagmi";
import {
  USDC_TOKEN_ABI,
  USDC_TOKEN_ADDRESS,
  formatUsdc,
  parseUsdc
} from "../lib/usdc";
import { AccountSelector } from "./AccountSelector";
import { Connect } from "./Connect";

export const SendTokens = () => {
  const { address, isConnected } = useAccount();

  // Form state
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedPercentage, setSelectedPercentage] = useState<number | null>(
    null
  );

  // Validation state
  const [recipientError, setRecipientError] = useState("");
  const [amountError, setAmountError] = useState("");

  // Transaction state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Get USDC balance
  const { data: usdcBalance, refetch: refetchUsdcBalance } = useBalance({
    address,
    token: USDC_TOKEN_ADDRESS
  });

  // Contract write
  const { data: hash, writeContract, isPending } = useWriteContract();

  // Wait for transaction
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash
  });

  // Validate recipient address
  const validateRecipient = (value: string) => {
    if (!value) {
      setRecipientError("Recipient address is required");
      return false;
    }
    if (!isAddress(value)) {
      setRecipientError("Invalid C-Chain (EVM) address format");
      return false;
    }
    if (value.toLowerCase() === address?.toLowerCase()) {
      setRecipientError("Cannot send to yourself");
      return false;
    }
    setRecipientError("");
    return true;
  };

  // Validate amount
  const validateAmount = (value: string) => {
    if (!value) {
      setAmountError("Amount is required");
      return false;
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
      setAmountError("Amount must be greater than 0");
      return false;
    }

    if (!usdcBalance) {
      setAmountError("Unable to fetch balance");
      return false;
    }

    const balanceInUsdc = parseFloat(formatUsdc(usdcBalance.value));
    if (numValue > balanceInUsdc) {
      setAmountError(
        `Insufficient balance. You have ${balanceInUsdc.toFixed(6)} USDC`
      );
      return false;
    }

    setAmountError("");
    return true;
  };

  // Handle recipient input change
  const handleRecipientChange = (value: string) => {
    setRecipient(value);
    if (value) {
      validateRecipient(value);
    } else {
      setRecipientError("");
    }
  };

  // Handle amount input change
  const handleAmountChange = (value: string) => {
    setAmount(value);
    setSelectedPercentage(null);
    if (value) {
      validateAmount(value);
    } else {
      setAmountError("");
    }
  };

  // Handle percentage button click
  const handlePercentageClick = (percentage: number) => {
    if (!usdcBalance) return;

    const balanceInUsdc = parseFloat(formatUsdc(usdcBalance.value));
    const calculatedAmount = (balanceInUsdc * percentage) / 100;
    const formattedAmount = calculatedAmount.toFixed(6);

    setAmount(formattedAmount);
    setSelectedPercentage(percentage);
    validateAmount(formattedAmount);
  };

  // Handle max button click
  const handleMaxClick = () => {
    if (!usdcBalance) return;

    const balanceInUsdc = parseFloat(formatUsdc(usdcBalance.value));
    const formattedAmount = balanceInUsdc.toFixed(6);

    setAmount(formattedAmount);
    setSelectedPercentage(null);
    validateAmount(formattedAmount);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected || !address) {
      alert("Please connect your wallet first");
      return;
    }

    const isRecipientValid = validateRecipient(recipient);
    const isAmountValid = validateAmount(amount);

    if (!isRecipientValid || !isAmountValid) {
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage("");

    try {
      const amountInWei = parseUsdc(amount);

      writeContract({
        address: USDC_TOKEN_ADDRESS,
        abi: USDC_TOKEN_ABI,
        functionName: "transfer",
        args: [recipient as `0x${string}`, amountInWei]
      });
    } catch (error) {
      console.error("Transaction error:", error);
      alert("Failed to send transaction. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Handle successful transaction
  useEffect(() => {
    if (isSuccess && hash) {
      setSuccessMessage(
        `Transaction successful! View on explorer: https://subnets-test.avax.network/c-chain/tx/${hash}`
      );
      setRecipient("");
      setAmount("");
      setSelectedPercentage(null);
      setIsSubmitting(false);
      refetchUsdcBalance();
    }
  }, [isSuccess, hash, refetchUsdcBalance]);

  // Reset form when wallet disconnects
  useEffect(() => {
    if (!isConnected) {
      setRecipient("");
      setAmount("");
      setSelectedPercentage(null);
      setRecipientError("");
      setAmountError("");
      setSuccessMessage("");
    }
  }, [isConnected]);

  const isFormValid = recipient && amount && !recipientError && !amountError;
  const isLoading = isPending || isConfirming || isSubmitting;

  return (
    <div className="container">
      <div className="card">
        <Connect />

        {successMessage && (
          <div className="success-message">
            {successMessage.includes("View on explorer") ? (
              <>
                Transaction successful!{" "}
                <a
                  href={successMessage.split("View on explorer: ")[1]}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on explorer
                </a>
              </>
            ) : (
              successMessage
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Account Section */}
          <AccountSelector />

          {/* Token and Amount Section */}
          <div className="form-group">
            <div className="balance-info">
              <div className="label">Amount</div>
              <div className="balance-amount">
                Balance:{" "}
                {isConnected && usdcBalance
                  ? `${formatUsdc(usdcBalance.value)} USDC`
                  : isConnected
                  ? "0 USDC"
                  : "- USDC"}
              </div>
            </div>

            <div className="amount-input-container">
              <div className="token-selector">
                <div className="token-logo">U</div>
                <div className="token-info">
                  <div className="token-name">USDC</div>
                  <div className="token-balance">
                    {isConnected && usdcBalance
                      ? `${formatUsdc(usdcBalance.value)} USDC`
                      : isConnected
                      ? "0 USDC"
                      : "- USDC"}
                  </div>
                </div>
              </div>

              <input
                type="text"
                className="amount-input"
                placeholder="0"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                disabled={!isConnected}
              />

              <button
                type="button"
                className="max-button"
                onClick={handleMaxClick}
                disabled={!isConnected || !usdcBalance}
              >
                Max
              </button>
            </div>

            <div className="usd-value">$0 USD</div>

            <div className="percentage-buttons">
              {[25, 50, 75].map((percentage) => (
                <button
                  key={percentage}
                  type="button"
                  className={`percentage-button ${
                    selectedPercentage === percentage ? "active" : ""
                  }`}
                  onClick={() => handlePercentageClick(percentage)}
                  disabled={!isConnected || !usdcBalance}
                >
                  {percentage}%
                </button>
              ))}
            </div>

            {amountError && <div className="error-message">{amountError}</div>}
          </div>

          {/* Recipient Section */}
          <div className="form-group">
            <div className="label">Send to</div>
            <input
              type="text"
              className={`input ${recipientError ? "error" : ""}`}
              placeholder="Select a contact or paste a Avalanche (C-Chain) address >"
              value={recipient}
              onChange={(e) => handleRecipientChange(e.target.value)}
              disabled={!isConnected}
            />
            {recipientError && (
              <div className="error-message">{recipientError}</div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="button"
            disabled={!isConnected || !isFormValid || isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading"></span>
                {isPending
                  ? "Confirming..."
                  : isConfirming
                  ? "Processing..."
                  : "Sending..."}
              </>
            ) : (
              "Send"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
