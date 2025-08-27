import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { truncateAddress } from "../lib/address";

/**
 * Component for connecting/disconnecting to injected web3 wallets such as the Core extension and Metamask.
 */
export const Connect = () => {
  const account = useAccount();
  const { disconnect } = useDisconnect();
  const { connect, isPending } = useConnect();

  const handleConnect = () => {
    connect({ connector: injected() });
  };

  const handleDisconnect = () => {
    disconnect();
  };

  return (
    <>
      {/* App Header */}
      <div className="app-header">
        <div className="header-content">
          <h1 className="title">Send Tokens</h1>
          <p className="subtitle">
            Send tokens to any address or contact on a given network
          </p>
        </div>

        {/* Connect Section - Top Right */}
        <div className="connect-section">
          {account?.isConnected ? (
            <div className="wallet-status">
              <div className="wallet-info">
                <div className="status-indicator"></div>
                <span className="wallet-address">
                  {truncateAddress(account.address)}
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
          ) : (
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
          )}
        </div>
      </div>
    </>
  );
};
