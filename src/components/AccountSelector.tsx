import { useEffect, useRef, useState } from "react";
import { formatEther } from "viem";
import { useAccount, useBalance, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { isValidAddress, truncateAddress } from "../lib/address";
import type { WalletProvider } from "../lib/types";
import { hasEthereum } from "../lib/types";

export const AccountSelector = () => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect, isPending, error } = useConnect();
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isWalletAvailable, setIsWalletAvailable] = useState<boolean | null>(
    null
  );
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if wallet is available
  useEffect(() => {
    const checkWalletAvailability = () => {
      // Check for Core wallet specifically
      if (!hasEthereum(window)) {
        setIsWalletAvailable(false);
        return;
      }

      const ethereum = window.ethereum;

      if (!ethereum) {
        setIsWalletAvailable(false);
        return;
      }

      const isCoreAvailable = Boolean(
        ethereum.isCore ||
          ethereum.isAvalanche ||
          ethereum.providers?.some(
            (provider: WalletProvider) =>
              provider.isCore || provider.isAvalanche
          )
      );

      // Check for any injected wallet
      const isAnyWalletAvailable = Boolean(
        ethereum || ethereum.providers?.length
      );

      setIsWalletAvailable(isCoreAvailable || isAnyWalletAvailable);
    };

    checkWalletAvailability();

    // Listen for wallet installation events
    const handleWalletInstalled = () => {
      checkWalletAvailability();
    };

    window.addEventListener("ethereum#initialized", handleWalletInstalled);
    window.addEventListener("ethereum#accountsChanged", handleWalletInstalled);

    return () => {
      window.removeEventListener("ethereum#initialized", handleWalletInstalled);
      window.removeEventListener(
        "ethereum#accountsChanged",
        handleWalletInstalled
      );
    };
  }, []);

  // Get AVAX balance for the current account
  const { data: avaxBalance } = useBalance({
    address: address
  });

  // Handle initial load state
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setIsInitialLoad(false);
      setIsLoading(false);
      timeoutRef.current = null;
    }, 600); // Allow time for entrance animation

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isConnected]);

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      await connect({ connector: injected() });
    } catch (err) {
      console.error("Failed to connect wallet:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const handleInstallCore = () => {
    window.open("https://core.app/", "_blank");
  };

  // Show loading skeleton during initial load
  if (isInitialLoad || isLoading) {
    return (
      <div className="form-group">
        <div className="label">Account</div>
        <div className="token-selector">
          <div className="wallet-status">
            <div className="wallet-info">
              <div className="status-indicator"></div>
              <span className="wallet-address">
                <span className="loading-skeleton">●●●●●●●●</span>
              </span>
            </div>
          </div>
          <div className="token-info">
            <div className="token-name">
              <span className="loading-skeleton">●●●●●●●●●●●●</span>
            </div>
            <div className="token-balance">
              <span className="loading-skeleton">●●● AVAX</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show wallet not available state
  if (isWalletAvailable === false) {
    return (
      <div className="form-group">
        <div className="label">Account</div>
        <div className="token-selector wallet-unavailable">
          <div className="wallet-status">
            <div className="wallet-info">
              <div className="status-indicator unavailable"></div>
              <span className="wallet-address">No wallet detected</span>
            </div>
          </div>
          <div className="wallet-action">
            <div className="wallet-message">
              <div className="wallet-description">
                Install Core Wallet to connect to Avalanche
              </div>
            </div>
            <button
              type="button"
              className="install-wallet-button"
              onClick={handleInstallCore}
            >
              Install Core Wallet
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="form-group">
        <div className="label">Account</div>
        <div className="token-selector">
          <button
            type="button"
            className="connect-wallet-button"
            onClick={handleConnect}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <span className="loading"></span>
                <span>Connecting...</span>
              </>
            ) : (
              "Connect Wallet"
            )}
          </button>
          <div className="token-info">
            <div className="token-name">Not connected</div>
            <div className="token-balance">- AVAX</div>
          </div>
          {error && (
            <div className="error-message">
              {error.message === "User rejected request."
                ? "Connection was cancelled"
                : error.message === "No provider was set"
                ? "No wallet provider found"
                : "Failed to connect wallet"}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="form-group">
      <div className="label">Account</div>
      <div className="token-selector">
        <div className="wallet-status">
          <div className="wallet-info">
            <div className="status-indicator"></div>
            <span className="wallet-address">
              {address && isValidAddress(address)
                ? truncateAddress(address)
                : ""}
            </span>
          </div>
          <button
            type="button"
            className="disconnect-button"
            onClick={handleDisconnect}
            disabled={isPending}
            title="Disconnect Wallet"
          >
            {isPending ? <span className="loading"></span> : "×"}
          </button>
        </div>
        <div className="token-info">
          <div className="token-name">
            {address && isValidAddress(address)
              ? truncateAddress(address)
              : "Unknown"}
          </div>
          <div className="token-balance">
            {avaxBalance ? `${formatEther(avaxBalance.value)} AVAX` : "- AVAX"}
          </div>
        </div>
      </div>
    </div>
  );
};
