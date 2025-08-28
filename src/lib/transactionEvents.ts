import { type PublicClient } from "viem";
import { USDC_TOKEN_ABI, USDC_TOKEN_ADDRESS } from "./usdc";

// Event listening enhancement for transaction status updates
// This provides real-time blockchain event monitoring as an alternative to polling

export interface TransactionEventConfig {
  txHash: `0x${string}`;
  fromAddress: string;
  toAddress: string;
  amount: bigint;
  onSuccess: () => void;
  onError: (error: Error) => void;
}

export class TransactionEventMonitor {
  private publicClient: PublicClient;
  private unwatch: (() => void) | null = null;
  private isActive = false;

  constructor(publicClient: PublicClient) {
    this.publicClient = publicClient;
  }

  /**
   * Start monitoring for USDC Transfer events related to a specific transaction
   * This provides faster transaction status updates than polling
   */
  async startMonitoring(config: TransactionEventConfig): Promise<void> {
    if (this.isActive) {
      this.stopMonitoring();
    }

    try {
      this.isActive = true;

      // Listen for all events from the USDC contract
      this.unwatch = await this.publicClient.watchContractEvent({
        address: USDC_TOKEN_ADDRESS,
        abi: USDC_TOKEN_ABI,
        onLogs: (logs) => {
          logs.forEach((log) => {
            // Check if this event matches our transaction
            if (log.transactionHash === config.txHash) {
              console.log("🎉 Event-based transaction confirmation!");
              console.log("Transaction hash:", config.txHash);
              console.log("Event log:", log);

              // For a real implementation, you would parse the event data here
              // This is a simplified example that just detects the event
              config.onSuccess();
              this.stopMonitoring();
            }
          });
        },
        onError: (error) => {
          console.warn("Event listener error:", error);
          config.onError(new Error("Event listener failed"));
          this.stopMonitoring();
        }
      });

      console.log("📡 Event listener started for transaction:", config.txHash);
    } catch (error) {
      console.warn("Failed to setup event listener:", error);
      config.onError(error as Error);
      this.isActive = false;
    }
  }

  /**
   * Stop monitoring and cleanup event listeners
   */
  stopMonitoring(): void {
    if (this.unwatch) {
      this.unwatch();
      this.unwatch = null;
    }
    this.isActive = false;
    console.log("🛑 Event listener stopped");
  }

  /**
   * Check if monitoring is currently active
   */
  isMonitoring(): boolean {
    return this.isActive;
  }
}

/**
 * Utility function to create a transaction event monitor
 */
export function createTransactionEventMonitor(
  publicClient: PublicClient
): TransactionEventMonitor {
  return new TransactionEventMonitor(publicClient);
}

/**
 * Example usage in a React component:
 *
 * ```typescript
 * const publicClient = usePublicClient();
 * const eventMonitor = useMemo(() => createTransactionEventMonitor(publicClient), [publicClient]);
 *
 * // When starting a transaction:
 * eventMonitor.startMonitoring({
 *   txHash: transactionHash,
 *   fromAddress: userAddress,
 *   toAddress: recipientAddress,
 *   amount: transferAmount,
 *   onSuccess: () => {
 *     console.log('Transaction confirmed via events!');
 *     // Update UI immediately
 *   },
 *   onError: (error) => {
 *     console.log('Event monitoring failed, falling back to polling');
 *     // Fallback to existing polling mechanism
 *   }
 * });
 *
 * // Cleanup on unmount:
 * useEffect(() => {
 *   return () => eventMonitor.stopMonitoring();
 * }, [eventMonitor]);
 * ```
 */
