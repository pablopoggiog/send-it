import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { WagmiProvider } from "wagmi";
import { config } from "../lib/wagmiConfig";
import { SendTokens } from "./SendTokens";

// Mock wagmi hooks
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
        value: BigInt("1000000"), // 1 USDC (6 decimals)
        decimals: 6,
        symbol: "USDC"
      },
      refetch: vi.fn()
    }),
    useWriteContract: () => ({
      writeContract: vi.fn(),
      isPending: false,
      error: null
    }),
    useWaitForTransactionReceipt: () => ({
      isLoading: false,
      isSuccess: false
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

describe("SendTokens", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the form with all required elements", () => {
    renderWithProviders(<SendTokens />);

    expect(screen.getByText("Send tokens")).toBeInTheDocument();
    expect(
      screen.getByText("Send USDC to any address on the Fuji network.")
    ).toBeInTheDocument();
    expect(screen.getByText("Account")).toBeInTheDocument();
    expect(screen.getByText("Amount")).toBeInTheDocument();
    expect(screen.getByText("Send to")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send" })).toBeInTheDocument();
  });

  it("displays connected wallet address", () => {
    renderWithProviders(<SendTokens />);

    expect(screen.getByText("0x1234...7890")).toBeInTheDocument();
  });

  it("displays USDC balance", () => {
    renderWithProviders(<SendTokens />);

    expect(screen.getByText("Balance: 1 USDC")).toBeInTheDocument();
  });

  it("shows percentage buttons", () => {
    renderWithProviders(<SendTokens />);

    expect(screen.getByRole("button", { name: "25%" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "50%" })).toBeInTheDocument();
  });

  it("shows max button", () => {
    renderWithProviders(<SendTokens />);

    expect(screen.getByRole("button", { name: "Max" })).toBeInTheDocument();
  });

  it("validates recipient address format", async () => {
    renderWithProviders(<SendTokens />);

    const recipientInput = screen.getByPlaceholderText(
      "Paste an Avalanche (C-Chain) address >"
    );

    // Test invalid address
    fireEvent.change(recipientInput, { target: { value: "invalid-address" } });

    await waitFor(() => {
      expect(
        screen.getByText("Invalid C-Chain (EVM) address format")
      ).toBeInTheDocument();
    });

    // Test valid address
    fireEvent.change(recipientInput, {
      target: { value: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6" }
    });

    await waitFor(() => {
      expect(
        screen.queryByText("Invalid C-Chain (EVM) address format")
      ).not.toBeInTheDocument();
    });
  });

  it("validates amount is greater than 0", async () => {
    renderWithProviders(<SendTokens />);

    const amountInput = screen.getByPlaceholderText("0");

    // Test zero amount
    fireEvent.change(amountInput, { target: { value: "0" } });

    await waitFor(() => {
      expect(
        screen.getByText("Amount must be greater than 0")
      ).toBeInTheDocument();
    });

    // Test valid amount
    fireEvent.change(amountInput, { target: { value: "0.5" } });

    await waitFor(() => {
      expect(
        screen.queryByText("Amount must be greater than 0")
      ).not.toBeInTheDocument();
    });
  });

  it("enables send button when form is valid", async () => {
    renderWithProviders(<SendTokens />);

    const sendButton = screen.getByRole("button", { name: "Send" });
    const recipientInput = screen.getByPlaceholderText(
      "Paste an Avalanche (C-Chain) address >"
    );
    const amountInput = screen.getByPlaceholderText("0");

    // Initially disabled
    expect(sendButton).toBeDisabled();

    // Fill in valid data
    fireEvent.change(recipientInput, {
      target: { value: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6" }
    });
    fireEvent.change(amountInput, { target: { value: "0.5" } });

    await waitFor(() => {
      expect(sendButton).not.toBeDisabled();
    });
  });

  it("handles percentage button clicks", async () => {
    renderWithProviders(<SendTokens />);

    const amountInput = screen.getByPlaceholderText("0");
    const percentageButton = screen.getByRole("button", { name: "50%" });

    fireEvent.click(percentageButton);

    await waitFor(() => {
      expect(amountInput).toHaveValue("0.500000");
    });
  });

  it("handles max button click", async () => {
    renderWithProviders(<SendTokens />);

    const amountInput = screen.getByPlaceholderText("0");
    const maxButton = screen.getByRole("button", { name: "Max" });

    fireEvent.click(maxButton);

    await waitFor(() => {
      expect(amountInput).toHaveValue("1.000000");
    });
  });
});
