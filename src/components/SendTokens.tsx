import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { isAddress } from "viem";
import {
  useAccount,
  useBalance,
  useWaitForTransactionReceipt,
  useWriteContract
} from "wagmi";
import { isValidAddress } from "../lib/address";
import type { FormErrors, SendTokensFormData } from "../lib/types";
import {
  USDC_TOKEN_ABI,
  USDC_TOKEN_ADDRESS,
  formatUsdc,
  parseUsdc
} from "../lib/usdc";
import { AccountSelector } from "./AccountSelector";
import { Header } from "./Header";

// Utility functions
const formatBalance = (balance: bigint | undefined, isConnected: boolean) => {
  if (!isConnected) return "- USDC";
  if (!balance) return "0 USDC";
  return `${formatUsdc(balance)} USDC`;
};

const isUserRejection = (errorMessage: string) => {
  const message = errorMessage.toLowerCase();
  return (
    message.includes("user rejected") ||
    message.includes("user denied") ||
    message.includes("user cancelled") ||
    message.includes("user canceled") ||
    message.includes("transaction cancelled") ||
    message.includes("transaction canceled")
  );
};

const getLoadingText = (
  isPending: boolean,
  isConfirming: boolean,
  isSubmitting: boolean
) => {
  if (isPending) return "Confirming...";
  if (isConfirming) return "Processing...";
  if (isSubmitting) return "Sending...";
  return "Loading...";
};

export const SendTokens = () => {
  const { address, isConnected } = useAccount();

  // Form state
  const [formData, setFormData] = useState<SendTokensFormData>({
    recipient: "",
    amount: "",
    selectedPercentage: null
  });

  // Validation state
  const [errors, setErrors] = useState<FormErrors>({
    recipient: "",
    amount: ""
  });

  // Transaction state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastId, setToastId] = useState<string | null>(null);

  // Wagmi hooks
  const { data: usdcBalance, refetch: refetchUsdcBalance } = useBalance({
    address,
    token: USDC_TOKEN_ADDRESS
  });

  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash
  });

  // Validation functions
  const validateRecipient = useCallback(
    (value: string) => {
      if (!value) {
        setErrors((prev) => ({
          ...prev,
          recipient: "Recipient address is required"
        }));
        return false;
      }
      if (!isAddress(value)) {
        setErrors((prev) => ({
          ...prev,
          recipient: "Invalid Avalanche (C-Chain) address format"
        }));
        return false;
      }
      if (value.toLowerCase() === address?.toLowerCase()) {
        setErrors((prev) => ({
          ...prev,
          recipient: "Cannot send to yourself"
        }));
        return false;
      }
      setErrors((prev) => ({ ...prev, recipient: "" }));
      return true;
    },
    [address]
  );

  const validateAmount = useCallback(
    (value: string) => {
      if (!value) {
        setErrors((prev) => ({ ...prev, amount: "Amount is required" }));
        return false;
      }

      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue <= 0) {
        setErrors((prev) => ({
          ...prev,
          amount: "Amount must be greater than 0"
        }));
        return false;
      }

      if (!usdcBalance) {
        setErrors((prev) => ({ ...prev, amount: "Unable to fetch balance" }));
        return false;
      }

      const balanceInUsdc = parseFloat(formatUsdc(usdcBalance.value));
      if (numValue > balanceInUsdc) {
        setErrors((prev) => ({
          ...prev,
          amount: `Insufficient balance. You have ${balanceInUsdc.toFixed(
            6
          )} USDC`
        }));
        return false;
      }

      setErrors((prev) => ({ ...prev, amount: "" }));
      return true;
    },
    [usdcBalance]
  );

  // Event handlers
  const handleRecipientChange = useCallback(
    (value: string) => {
      setFormData((prev) => ({ ...prev, recipient: value }));
      if (value) {
        validateRecipient(value);
      } else {
        setErrors((prev) => ({ ...prev, recipient: "" }));
      }
    },
    [validateRecipient]
  );

  const handleAmountChange = useCallback(
    (value: string) => {
      setFormData((prev) => ({
        ...prev,
        amount: value,
        selectedPercentage: null
      }));
      if (value) {
        validateAmount(value);
      } else {
        setErrors((prev) => ({ ...prev, amount: "" }));
      }
    },
    [validateAmount]
  );

  const handlePercentageClick = useCallback(
    (percentage: number) => {
      if (!usdcBalance) return;

      const balanceInUsdc = parseFloat(formatUsdc(usdcBalance.value));
      const calculatedAmount = (balanceInUsdc * percentage) / 100;
      const formattedAmount = calculatedAmount.toFixed(6);

      setFormData((prev) => ({
        ...prev,
        amount: formattedAmount,
        selectedPercentage: percentage
      }));
      validateAmount(formattedAmount);
    },
    [usdcBalance, validateAmount]
  );

  const handleMaxClick = useCallback(() => {
    if (!usdcBalance) return;

    const balanceInUsdc = parseFloat(formatUsdc(usdcBalance.value));
    const formattedAmount = balanceInUsdc.toFixed(6);

    setFormData((prev) => ({
      ...prev,
      amount: formattedAmount,
      selectedPercentage: null
    }));
    validateAmount(formattedAmount);
  }, [usdcBalance, validateAmount]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!isConnected || !address) {
        toast.error("Please connect your wallet first");
        return;
      }

      const isRecipientValid = validateRecipient(formData.recipient);
      const isAmountValid = validateAmount(formData.amount);

      if (!isRecipientValid || !isAmountValid) return;

      setIsSubmitting(true);
      const id = toast.loading("Preparing transaction...");
      setToastId(id);

      try {
        const amountInWei = parseUsdc(formData.amount);
        if (!isValidAddress(formData.recipient)) {
          throw new Error("Invalid recipient address");
        }

        writeContract({
          address: USDC_TOKEN_ADDRESS,
          abi: USDC_TOKEN_ABI,
          functionName: "transfer",
          args: [formData.recipient, amountInWei]
        });
      } catch (error) {
        console.error("Transaction error:", error);
        toast.error("Failed to send transaction. Please try again.", { id });
        setIsSubmitting(false);
        setToastId(null);
      }
    },
    [
      isConnected,
      address,
      formData,
      validateRecipient,
      validateAmount,
      writeContract
    ]
  );

  // Reset form
  const resetForm = useCallback(
    (dismissToast = true) => {
      setFormData({ recipient: "", amount: "", selectedPercentage: null });
      setErrors({ recipient: "", amount: "" });
      setIsSubmitting(false);
      if (dismissToast && toastId) {
        toast.dismiss(toastId);
        setToastId(null);
      }
    },
    [toastId]
  );

  // Effects
  useEffect(() => {
    if (!toastId) return;

    if (isPending) {
      toast.loading("Confirming transaction...", { id: toastId });
    } else if (isConfirming) {
      toast.loading("Processing transaction...", { id: toastId });
    }
  }, [isPending, isConfirming, toastId]);

  useEffect(() => {
    if (isSuccess && hash && toastId) {
      toast.success(
        <div>
          <div style={{ marginBottom: "8px", fontWeight: "600" }}>
            Transaction successful!
          </div>
          <a
            href={`https://subnets-test.avax.network/c-chain/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "#fff",
              textDecoration: "underline",
              fontSize: "12px",
              opacity: "0.9",
              transition: "opacity 0.2s ease"
            }}
            onMouseEnter={(e) =>
              ((e.target as HTMLElement).style.opacity = "1")
            }
            onMouseLeave={(e) =>
              ((e.target as HTMLElement).style.opacity = "0.9")
            }
          >
            View on explorer
          </a>
        </div>,
        { id: toastId }
      );

      // Reset form without dismissing the success toast
      resetForm(false);
      refetchUsdcBalance();
    }
  }, [isSuccess, hash, toastId, refetchUsdcBalance, resetForm]);

  useEffect(() => {
    if (error && toastId) {
      console.error("Transaction error:", error);

      if (isUserRejection(error.message || "")) {
        toast.dismiss(toastId);
        toast.error("Transaction was cancelled by user");
      } else {
        toast.error("Transaction failed. Please try again.", { id: toastId });
      }

      setIsSubmitting(false);
      setToastId(null);
    }
  }, [error, toastId]);

  useEffect(() => {
    if (!isConnected) {
      resetForm();
    }
  }, [isConnected, resetForm]);

  // Computed values
  const isFormValid =
    formData.recipient &&
    formData.amount &&
    !errors.recipient &&
    !errors.amount;
  const isLoading = isPending || isConfirming || isSubmitting;
  const balanceDisplay = formatBalance(usdcBalance?.value, isConnected);
  const isMaxActive =
    formData.selectedPercentage === null &&
    formData.amount ===
      (usdcBalance ? parseFloat(formatUsdc(usdcBalance.value)).toFixed(6) : "");

  return (
    <div className="container">
      <div className="card">
        <Header />

        <form onSubmit={handleSubmit}>
          <AccountSelector />

          <div className="form-group">
            <div className="balance-info">
              <div className="label">Amount</div>
              <div className="balance-amount">Balance: {balanceDisplay}</div>
            </div>

            <div className="amount-input-container">
              <div className="token-selector">
                <div className="token-logo">U</div>
                <div className="token-info">
                  <div className="token-name">USDC</div>
                  <div className="token-balance">{balanceDisplay}</div>
                </div>
              </div>

              <input
                type="text"
                className="amount-input"
                placeholder="0"
                value={formData.amount}
                onChange={(e) => {
                  const value = e.target.value;
                  // Only allow numbers and one decimal point
                  if (value === "" || /^\d*\.?\d*$/.test(value)) {
                    handleAmountChange(value);
                  }
                }}
                onKeyPress={(e) => {
                  // Prevent non-numeric characters except decimal point
                  if (!/[\d.]/.test(e.key)) {
                    e.preventDefault();
                  }
                  // Prevent multiple decimal points
                  if (e.key === "." && formData.amount.includes(".")) {
                    e.preventDefault();
                  }
                }}
                disabled={!isConnected}
              />
            </div>

            <div className="usd-value">$0 USD</div>

            <div className="percentage-buttons">
              {[25, 50].map((percentage) => (
                <button
                  key={percentage}
                  type="button"
                  className={`percentage-button percentage-button-special ${
                    formData.selectedPercentage === percentage ? "active" : ""
                  }`}
                  onClick={() => handlePercentageClick(percentage)}
                  disabled={!isConnected || !usdcBalance}
                >
                  {percentage}%
                </button>
              ))}
              <button
                type="button"
                className={`percentage-button max-button-special ${
                  isMaxActive ? "active" : ""
                }`}
                onClick={handleMaxClick}
                disabled={!isConnected || !usdcBalance}
              >
                Max
              </button>
            </div>

            {errors.amount && (
              <div className="error-message">{errors.amount}</div>
            )}
          </div>

          <div className="form-group">
            <div className="label">Send to</div>
            <input
              type="text"
              className={`input ${errors.recipient ? "error" : ""}`}
              placeholder="Paste an Avalanche (C-Chain) address"
              value={formData.recipient}
              onChange={(e) => handleRecipientChange(e.target.value)}
              disabled={!isConnected}
            />
            {errors.recipient && (
              <div className="error-message">{errors.recipient}</div>
            )}
          </div>

          <button
            type="submit"
            className="button"
            disabled={!isConnected || !isFormValid || isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading"></span>
                {getLoadingText(isPending, isConfirming, isSubmitting)}
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
