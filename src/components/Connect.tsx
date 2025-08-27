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
      <div className="header">
        <div>
          <h1 className="title">Send Tokens</h1>
          <p className="subtitle">
            Send tokens to any address or contact on a given network
          </p>
        </div>

        {account?.isConnected ? (
          <div className="account-info">
            <div className="account-info-text">
              <span>Connected: </span>
              <span className="account-address">
                {truncateAddress(account.address)}
              </span>
            </div>
            <button
              type="button"
              className="connect-button secondary"
              onClick={handleDisconnect}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <span className="loading"></span>
                  Disconnecting...
                </>
              ) : (
                "Disconnect"
              )}
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="connect-button"
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
    </>
  );
};
