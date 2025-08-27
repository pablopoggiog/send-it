import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { WagmiProvider } from "wagmi";
import { config } from "../lib/wagmiConfig";
import { AccountSelector } from "./AccountSelector";

// Mock wagmi hooks
const mockWalletClient = {
  request: vi.fn()
};

vi.mock("wagmi", async () => {
  const actual = await vi.importActual("wagmi");
  return {
    ...actual,
    useAccount: () => ({
      address: "0x1234567890123456789012345678901234567890",
      isConnected: true
    }),
    useBalance: () => ({
      data: {
        value: BigInt("2000000000000000000"), // 2 AVAX
        decimals: 18,
        symbol: "AVAX"
      }
    }),
    useWalletClient: () => ({
      data: mockWalletClient
    })
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

describe("AccountSelector", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock wallet accounts response
    mockWalletClient.request.mockResolvedValue([
      "0x1234567890123456789012345678901234567890",
      "0x56d2CF4bf1234567890123456789012345678901BDf"
    ]);
  });

  it("renders the account selector with label", () => {
    renderWithProviders(<AccountSelector />);

    expect(screen.getByText("Account")).toBeInTheDocument();
  });

  it("displays the selected account name", () => {
    renderWithProviders(<AccountSelector />);

    expect(screen.getByText("Account 1")).toBeInTheDocument();
  });

  it("displays the account balance", () => {
    renderWithProviders(<AccountSelector />);

    expect(screen.getByText("2 AVAX")).toBeInTheDocument();
  });

  it("shows dropdown arrow", () => {
    renderWithProviders(<AccountSelector />);

    expect(screen.getByText("▼")).toBeInTheDocument();
  });

  it("opens dropdown when clicked", async () => {
    renderWithProviders(<AccountSelector />);

    const accountSelector = screen
      .getByText("Account 1")
      .closest(".account-selector");
    fireEvent.click(accountSelector!);

    await waitFor(() => {
      expect(screen.getByText("avalanche core")).toBeInTheDocument();
      expect(screen.getByText("Account 2")).toBeInTheDocument();
      expect(screen.getByText("Account 3")).toBeInTheDocument();
    });
  });

  it("shows search input in dropdown", async () => {
    renderWithProviders(<AccountSelector />);

    const accountSelector = screen
      .getByText("Account 1")
      .closest(".account-selector");
    fireEvent.click(accountSelector!);

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
    });
  });

  it("changes arrow direction when dropdown is open", async () => {
    renderWithProviders(<AccountSelector />);

    const accountSelector = screen
      .getByText("Account 1")
      .closest(".account-selector");
    fireEvent.click(accountSelector!);

    await waitFor(() => {
      expect(screen.getByText("▲")).toBeInTheDocument();
    });
  });

  it("selects a different account when clicked", async () => {
    renderWithProviders(<AccountSelector />);

    const accountSelector = screen
      .getByText("Account 1")
      .closest(".account-selector");
    fireEvent.click(accountSelector!);

    await waitFor(() => {
      const account2 = screen.getByText("Account 2");
      fireEvent.click(account2);
    });

    // The dropdown should close and the selected account should change
    await waitFor(() => {
      expect(screen.queryByText("avalanche core")).not.toBeInTheDocument();
    });
  });

  it("shows checkmark for selected account", async () => {
    renderWithProviders(<AccountSelector />);

    const accountSelector = screen
      .getByText("Account 1")
      .closest(".account-selector");
    fireEvent.click(accountSelector!);

    await waitFor(() => {
      expect(screen.getByText("✓")).toBeInTheDocument();
    });
  });
});
