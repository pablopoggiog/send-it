import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

/**
 * This is a component used for connecting/disconnecting to injected web3 wallets such as the Core extension and Metamask.
 * Feel free to delete/rewrite/style this component to complete the assignment.
 */
export const Connect = () => {
  const account = useAccount();
  const { disconnect } = useDisconnect();
  const { connect } = useConnect();

  return account?.isConnected ? (
    <button type="button" onClick={() => disconnect()}>
      Disconnect {account.address}
    </button>
  ) : (
    <button type="button" onClick={() => connect({ connector: injected() })}>
      Connect
    </button>
  );
};
