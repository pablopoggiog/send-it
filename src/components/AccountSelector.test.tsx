import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
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

describe("<AccountSelector />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConnect.mockClear();
    mockDisconnect.mockClear();
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
});
