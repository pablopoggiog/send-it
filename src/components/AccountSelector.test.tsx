import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { WagmiProvider } from "wagmi";
import { config } from "../lib/wagmiConfig";
import { AccountSelector } from "./AccountSelector";

// Mock wagmi hooks
const mockConnect = vi.fn();
const mockDisconnect = vi.fn();

vi.mock("wagmi", async () => {
  const actual = await vi.importActual("wagmi");
  return {
    ...actual,
    useAccount: vi.fn(),
    useBalance: vi.fn(),
    useConnect: vi.fn(),
    useDisconnect: vi.fn(),
    useWalletClient: vi.fn()
  };
});

// Mock the types module
vi.mock("../lib/types", () => ({
  hasEthereum: vi.fn(),
  WalletProvider: {}
}));

const queryClient = new QueryClient();

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    </WagmiProvider>
  );
};

// Import wagmi hooks for mocking
const { useAccount, useBalance, useConnect, useDisconnect, useWalletClient } =
  await import("wagmi");

// Import the mocked types
const { hasEthereum } = await import("../lib/types");

describe("<AccountSelector />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConnect.mockClear();
    mockDisconnect.mockClear();

    // Reset window.ethereum mock
    Object.defineProperty(window, "ethereum", {
      value: undefined,
      writable: true,
      configurable: true
    });
  });

  it("should render the account selector with label", () => {
    (useAccount as any).mockReturnValue({
      address: undefined,
      isConnected: false
    });
    (useBalance as any).mockReturnValue({
      data: null
    });
    (useConnect as any).mockReturnValue({
      connect: mockConnect,
      isPending: false
    });
    (useDisconnect as any).mockReturnValue({
      disconnect: mockDisconnect
    });
    (useWalletClient as any).mockReturnValue({
      data: null
    });

    renderWithProviders(<AccountSelector />);

    expect(screen.getByText("Account")).toBeInTheDocument();
  });

  it("should show loading skeletons during initial load", () => {
    (useAccount as any).mockReturnValue({
      address: undefined,
      isConnected: false
    });
    (useBalance as any).mockReturnValue({
      data: null
    });
    (useConnect as any).mockReturnValue({
      connect: mockConnect,
      isPending: false
    });
    (useDisconnect as any).mockReturnValue({
      disconnect: mockDisconnect
    });
    (useWalletClient as any).mockReturnValue({
      data: null
    });

    renderWithProviders(<AccountSelector />);

    // Should show all 3 loading skeleton elements
    const skeletonElements = document.querySelectorAll(".loading-skeleton");
    expect(skeletonElements.length).toBe(3);
  });

  it("should render with proper structure", () => {
    (useAccount as any).mockReturnValue({
      address: undefined,
      isConnected: false
    });
    (useBalance as any).mockReturnValue({
      data: null
    });
    (useConnect as any).mockReturnValue({
      connect: mockConnect,
      isPending: false
    });
    (useDisconnect as any).mockReturnValue({
      disconnect: mockDisconnect
    });
    (useWalletClient as any).mockReturnValue({
      data: null
    });

    renderWithProviders(<AccountSelector />);

    // Check that the component renders with the expected structure
    expect(screen.getByText("Account")).toBeInTheDocument();
    expect(document.querySelector(".form-group")).toBeInTheDocument();
    expect(document.querySelector(".token-selector")).toBeInTheDocument();
  });

  it("should show wallet not available state when no wallet is detected", async () => {
    (useAccount as any).mockReturnValue({
      address: undefined,
      isConnected: false
    });
    (useBalance as any).mockReturnValue({
      data: null
    });
    (useConnect as any).mockReturnValue({
      connect: mockConnect,
      isPending: false
    });
    (useDisconnect as any).mockReturnValue({
      disconnect: mockDisconnect
    });
    (useWalletClient as any).mockReturnValue({
      data: null
    });

    // Mock hasEthereum to return false
    (hasEthereum as any).mockReturnValue(false);

    renderWithProviders(<AccountSelector />);

    // Wait for the initial loading to complete
    await waitFor(
      () => {
        expect(screen.getByText("No wallet detected")).toBeInTheDocument();
      },
      { timeout: 1000 }
    );

    // Check for wallet unavailable state elements
    expect(
      screen.getByText("Install Core Wallet to connect to Avalanche")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Install Core Wallet" })
    ).toBeInTheDocument();
    expect(document.querySelector(".wallet-unavailable")).toBeInTheDocument();
    expect(
      document.querySelector(".status-indicator.unavailable")
    ).toBeInTheDocument();
  });

  it("should show connect wallet button when wallet is available but not connected", async () => {
    (useAccount as any).mockReturnValue({
      address: undefined,
      isConnected: false
    });
    (useBalance as any).mockReturnValue({
      data: null
    });
    (useConnect as any).mockReturnValue({
      connect: mockConnect,
      isPending: false
    });
    (useDisconnect as any).mockReturnValue({
      disconnect: mockDisconnect
    });
    (useWalletClient as any).mockReturnValue({
      data: null
    });

    // Mock hasEthereum to return true and set up ethereum object
    (hasEthereum as any).mockReturnValue(true);
    Object.defineProperty(window, "ethereum", {
      value: {
        isCore: true,
        providers: []
      },
      writable: true,
      configurable: true
    });

    renderWithProviders(<AccountSelector />);

    // Wait for the initial loading to complete
    await waitFor(
      () => {
        expect(
          screen.getByRole("button", { name: "Connect Wallet" })
        ).toBeInTheDocument();
      },
      { timeout: 1000 }
    );

    // Should not show wallet unavailable state
    expect(screen.queryByText("No wallet detected")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Install Core Wallet to connect to Avalanche")
    ).not.toBeInTheDocument();
  });

  it("should handle install Core wallet button click", async () => {
    (useAccount as any).mockReturnValue({
      address: undefined,
      isConnected: false
    });
    (useBalance as any).mockReturnValue({
      data: null
    });
    (useConnect as any).mockReturnValue({
      connect: mockConnect,
      isPending: false
    });
    (useDisconnect as any).mockReturnValue({
      disconnect: mockDisconnect
    });
    (useWalletClient as any).mockReturnValue({
      data: null
    });

    // Mock hasEthereum to return false
    (hasEthereum as any).mockReturnValue(false);

    // Mock window.open
    const mockOpen = vi.fn();
    Object.defineProperty(window, "open", {
      value: mockOpen,
      writable: true,
      configurable: true
    });

    renderWithProviders(<AccountSelector />);

    // Wait for the initial loading to complete
    await waitFor(
      () => {
        expect(
          screen.getByRole("button", { name: "Install Core Wallet" })
        ).toBeInTheDocument();
      },
      { timeout: 1000 }
    );

    // Click the install button
    screen.getByRole("button", { name: "Install Core Wallet" }).click();

    // Verify window.open was called with correct URL
    expect(mockOpen).toHaveBeenCalledWith("https://core.app/", "_blank");
  });

  it("should show error message when connection fails", async () => {
    (useAccount as any).mockReturnValue({
      address: undefined,
      isConnected: false
    });
    (useBalance as any).mockReturnValue({
      data: null
    });
    (useConnect as any).mockReturnValue({
      connect: mockConnect,
      isPending: false,
      error: { message: "User rejected request." }
    });
    (useDisconnect as any).mockReturnValue({
      disconnect: mockDisconnect
    });
    (useWalletClient as any).mockReturnValue({
      data: null
    });

    // Mock hasEthereum to return true
    (hasEthereum as any).mockReturnValue(true);
    Object.defineProperty(window, "ethereum", {
      value: { isCore: true },
      writable: true,
      configurable: true
    });

    renderWithProviders(<AccountSelector />);

    // Wait for the initial loading to complete
    await waitFor(
      () => {
        expect(
          screen.getByText("Connection was cancelled")
        ).toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });

  it("should show different error messages for different error types", async () => {
    (useAccount as any).mockReturnValue({
      address: undefined,
      isConnected: false
    });
    (useBalance as any).mockReturnValue({
      data: null
    });
    (useConnect as any).mockReturnValue({
      connect: mockConnect,
      isPending: false,
      error: { message: "No provider was set" }
    });
    (useDisconnect as any).mockReturnValue({
      disconnect: mockDisconnect
    });
    (useWalletClient as any).mockReturnValue({
      data: null
    });

    // Mock hasEthereum to return true
    (hasEthereum as any).mockReturnValue(true);
    Object.defineProperty(window, "ethereum", {
      value: { isCore: true },
      writable: true,
      configurable: true
    });

    renderWithProviders(<AccountSelector />);

    // Wait for the initial loading to complete
    await waitFor(
      () => {
        expect(
          screen.getByText("No wallet provider found")
        ).toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });
});
