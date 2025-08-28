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

const isGasEstimationError = (error: any) => {
  const message = (error.message || "").toLowerCase();
  const name = (error.name || "").toLowerCase();

  // More specific detection of gas-related errors
  return (
    message.includes("unable to get transaction hash") ||
    message.includes("insufficient funds for gas") ||
    message.includes("gas estimation failed") ||
    message.includes("out of gas") ||
    message.includes("gas required exceeds allowance") ||
    (name === "contractfunctionexecutionerror" &&
      (message.includes("reverted") || message.includes("execution failed"))) ||
    (name === "contractfunctionrevertederror" &&
      (message.includes("reverted") || message.includes("execution failed")))
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
  const {
    data: usdcBalance,
    refetch: refetchUsdcBalance,
    isLoading: isLoadingUsdcBalance
  } = useBalance({
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
        if (isGasEstimationError(error)) {
          // Provide specific error message for gas estimation failures
          toast.error(
            `Transaction failed, likely due to gas estimation issues. You may need more AVAX for gas fees, or try a gas-free transaction if supported by your wallet.`,
            { id: toastId }
          );
        } else {
          toast.error("Transaction failed. Please try again.", { id: toastId });
        }
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

  // Accessibility: Generate unique IDs for form elements
  const amountInputId = "amount-input";
  const recipientInputId = "recipient-input";
  const amountErrorId = "amount-error";
  const recipientErrorId = "recipient-error";
  const balanceInfoId = "balance-info";

  return (
    <div className="container">
      <div className="card">
        <Header />

        <form onSubmit={handleSubmit} role="form" aria-label="Send USDC tokens">
          <AccountSelector />

          <div className="form-group">
            <div className="balance-info" id={balanceInfoId}>
              <div className="balance-info-row">
                <div className="label">Amount</div>
                <div className="balance-amount" aria-live="polite">
                  {isLoadingUsdcBalance ? (
                    <span className="balance-loading">
                      <span className="loading-dots"></span>
                      Loading balance...
                    </span>
                  ) : (
                    `Balance: ${balanceDisplay}`
                  )}
                </div>
              </div>
            </div>

            <div className="amount-input-container">
              <div className="token-selector">
                <div className="token-logo" aria-hidden="true">
                  U
                </div>
                <div className="token-info">
                  <div className="token-name">USDC</div>
                  <div className="token-balance" aria-live="polite">
                    {isLoadingUsdcBalance ? (
                      <span className="balance-loading">
                        <span className="loading-dots"></span>
                        Loading...
                      </span>
                    ) : (
                      balanceDisplay
                    )}
                  </div>
                </div>
              </div>

              <input
                id={amountInputId}
                type="text"
                className="amount-input"
                placeholder="0"
                value={formData.amount}
                aria-label="USDC amount to send"
                aria-describedby={`${amountErrorId} ${balanceInfoId}`}
                aria-invalid={!!errors.amount}
                aria-required="true"
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

            <div className="usd-value" aria-hidden="true">
              $0 USD
            </div>

            <div
              className="percentage-buttons"
              role="group"
              aria-label="Quick amount selection"
            >
              {[25, 50].map((percentage) => (
                <button
                  key={percentage}
                  type="button"
                  className={`percentage-button percentage-button-special ${
                    formData.selectedPercentage === percentage ? "active" : ""
                  }`}
                  onClick={() => handlePercentageClick(percentage)}
                  disabled={
                    !isConnected || !usdcBalance || isLoadingUsdcBalance
                  }
                  aria-label={`Select ${percentage}% of your USDC balance`}
                  aria-pressed={formData.selectedPercentage === percentage}
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
                disabled={!isConnected || !usdcBalance || isLoadingUsdcBalance}
                aria-label="Select maximum USDC balance"
                aria-pressed={isMaxActive}
              >
                Max
              </button>
            </div>

            {errors.amount && (
              <div
                className="error-message"
                id={amountErrorId}
                role="alert"
                aria-live="assertive"
              >
                {errors.amount}
              </div>
            )}
          </div>

          <div className="form-group">
            <div className="label" id="recipient-label">
              Send to
            </div>
            <input
              id={recipientInputId}
              type="text"
              className={`input ${errors.recipient ? "error" : ""}`}
              placeholder="Paste an Avalanche (C-Chain) address"
              value={formData.recipient}
              aria-label="Recipient wallet address"
              aria-labelledby="recipient-label"
              aria-describedby={recipientErrorId}
              aria-invalid={!!errors.recipient}
              aria-required="true"
              onChange={(e) => handleRecipientChange(e.target.value)}
              disabled={!isConnected}
            />
            {errors.recipient && (
              <div
                className="error-message"
                id={recipientErrorId}
                role="alert"
                aria-live="assertive"
              >
                {errors.recipient}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="button"
            disabled={
              !isConnected || !isFormValid || isLoading || isLoadingUsdcBalance
            }
            aria-label={
              isLoading ? "Processing transaction" : "Send USDC tokens"
            }
            aria-describedby={
              !isFormValid ? "form-validation-errors" : undefined
            }
          >
            {isLoading ? (
              <>
                <span className="loading" aria-hidden="true"></span>
                <span>
                  {getLoadingText(isPending, isConfirming, isSubmitting)}
                </span>
              </>
            ) : (
              "Send"
            )}
          </button>

          {!isFormValid && (errors.recipient || errors.amount) && (
            <div
              id="form-validation-errors"
              className="sr-only"
              aria-live="polite"
            >
              Please fix the form errors before submitting
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
