import { useEffect, useRef, useState } from "react";
import { formatEther } from "viem";
import { useAccount, useBalance, useWalletClient } from "wagmi";
import { truncateAddress } from "../lib/address";

interface Account {
  address: string;
  name: string;
  balance: string;
}

export const AccountSelector = () => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get AVAX balance for the current account
  const { data: avaxBalance } = useBalance({
    address: address as `0x${string}`
  });

  // Fetch all accounts from the wallet
  const fetchAccounts = async () => {
    if (!walletClient || !isConnected) return;

    setIsLoading(true);
    try {
      // Try to get accounts from the wallet
      const walletAccounts = await walletClient.request({
        method: "eth_accounts"
      });

      // If we get multiple accounts, create account objects
      if (Array.isArray(walletAccounts) && walletAccounts.length > 0) {
        const accountPromises = walletAccounts.map(async (acc, index) => {
          // Get balance for each account
          const balance = await walletClient.request({
            method: "eth_getBalance",
            params: [acc, "latest"]
          });

          return {
            address: acc,
            name: `Account ${index + 1}`,
            balance: `${formatEther(BigInt(balance))} AVAX`
          };
        });

        const fetchedAccounts = await Promise.all(accountPromises);
        setAccounts(fetchedAccounts);

        // Set the current account as selected
        const currentAccount = fetchedAccounts.find(
          (acc) => acc.address.toLowerCase() === address?.toLowerCase()
        );
        setSelectedAccount(currentAccount || fetchedAccounts[0]);
      } else {
        // Fallback to single account if wallet doesn't support multiple accounts
        const singleAccount: Account = {
          address: address || "",
          name: "Account 1",
          balance: avaxBalance
            ? `${formatEther(avaxBalance.value)} AVAX`
            : "0 AVAX"
        };
        setAccounts([singleAccount]);
        setSelectedAccount(singleAccount);
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
      // Fallback to single account on error
      const fallbackAccount: Account = {
        address: address || "",
        name: "Account 1",
        balance: avaxBalance
          ? `${formatEther(avaxBalance.value)} AVAX`
          : "0 AVAX"
      };
      setAccounts([fallbackAccount]);
      setSelectedAccount(fallbackAccount);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch accounts when wallet connects or changes
  useEffect(() => {
    if (isConnected && walletClient) {
      fetchAccounts();
    }
  }, [isConnected, walletClient, address]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAccountSelect = async (account: Account) => {
    // Only allow switching if it's a different account
    if (selectedAccount?.address === account.address) {
      setIsOpen(false);
      return;
    }

    setSelectedAccount(account);
    setIsOpen(false);

    // Try to switch accounts if the wallet supports it
    try {
      if (walletClient) {
        // Method 1: Try wallet_switchEthereumChain (for some wallets)
        try {
          await walletClient.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0xa869" }] // Fuji testnet
          });
        } catch (switchError) {
          console.log("Chain switching not needed or not supported");
        }

        // Method 2: Request account switching
        await walletClient.request({
          method: "wallet_requestPermissions",
          params: [
            {
              eth_accounts: {}
            }
          ]
        });

        // Method 3: Try to request specific account (some wallets support this)
        try {
          await walletClient.request({
            method: "eth_requestAccounts"
          });
        } catch (requestError) {
          console.log("Specific account request not supported");
        }

        // Refresh accounts after switching
        setTimeout(() => {
          fetchAccounts();
        }, 1000); // Give wallet time to update
      }
    } catch (error) {
      console.log(
        "Account switching not supported by this wallet or user denied"
      );
      // Revert selection if switching failed
      const currentAccount = accounts.find(
        (acc) => acc.address.toLowerCase() === address?.toLowerCase()
      );
      setSelectedAccount(currentAccount || accounts[0]);
    }
  };

  const toggleDropdown = () => {
    if (isConnected && accounts.length > 1) {
      setIsOpen(!isOpen);
    }
  };

  if (!isConnected) {
    return (
      <div className="form-group">
        <div className="label">Account</div>
        <div className="token-selector">
          <div className="token-info">
            <div className="token-name">Not connected</div>
            <div className="token-balance">0 AVAX</div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="form-group">
        <div className="label">Account</div>
        <div className="token-selector">
          <div className="token-info">
            <div className="token-name">Loading accounts...</div>
            <div className="token-balance">0 AVAX</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="form-group">
      <div className="label">Account</div>
      <div className="account-selector-container" ref={dropdownRef}>
        <div
          className={`token-selector account-selector ${
            accounts.length > 1 ? "clickable" : ""
          }`}
          onClick={toggleDropdown}
        >
          <div className="token-info">
            <div className="token-name">
              {selectedAccount?.name || "Account 1"}
            </div>
            <div className="token-balance">
              {selectedAccount?.balance || "0 AVAX"}
            </div>
          </div>
          <div className="account-address">
            {selectedAccount ? truncateAddress(selectedAccount.address) : ""}
          </div>
          {accounts.length > 1 && (
            <div className="dropdown-arrow">{isOpen ? "▲" : "▼"}</div>
          )}
        </div>

        {isOpen && accounts.length > 1 && (
          <div className="account-dropdown">
            <div className="dropdown-header">
              <div className="dropdown-title">avalanche core</div>
              <div className="dropdown-arrow">▲</div>
            </div>

            <div className="search-container">
              <div className="search-icon">🔍</div>
              <input
                type="text"
                className="search-input"
                placeholder="Search..."
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            <div className="account-list">
              {accounts.map((account) => (
                <div
                  key={account.address}
                  className={`account-item ${
                    selectedAccount?.address === account.address
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => handleAccountSelect(account)}
                >
                  <div className="account-item-info">
                    <div className="account-item-name">{account.name}</div>
                    <div className="account-item-address">
                      {truncateAddress(account.address)}
                    </div>
                  </div>
                  <div className="account-item-balance">{account.balance}</div>
                  {selectedAccount?.address === account.address && (
                    <div className="account-item-check">✓</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
