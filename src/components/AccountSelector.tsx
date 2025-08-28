import { useEffect, useRef, useState } from "react";
import { formatEther } from "viem";
import { useAccount, useBalance, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { truncateAddress } from "../lib/address";

export const AccountSelector = () => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect, isPending } = useConnect();
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  const handleConnect = () => {
    connect({ connector: injected() });
  };

  const handleDisconnect = () => {
    disconnect();
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
                Connecting...
              </>
            ) : (
              "Connect Wallet"
            )}
          </button>
          <div className="token-info">
            <div className="token-name">Not connected</div>
            <div className="token-balance">- AVAX</div>
          </div>
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
              {address ? truncateAddress(address as `0x${string}`) : ""}
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
            {address ? truncateAddress(address as `0x${string}`) : "Unknown"}
          </div>
          <div className="token-balance">
            {avaxBalance ? `${formatEther(avaxBalance.value)} AVAX` : "- AVAX"}
          </div>
        </div>
      </div>
    </div>
  );
};
