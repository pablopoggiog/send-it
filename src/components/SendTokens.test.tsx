import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import toast from "react-hot-toast";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { WagmiProvider } from "wagmi";
import { config } from "../lib/wagmiConfig";
import { SendTokens } from "./SendTokens";

// Mock react-hot-toast
vi.mock("react-hot-toast", () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn()
  }
}));

// Mock wagmi hooks
const mockWriteContract = vi.fn();
const mockRefetchUsdcBalance = vi.fn();

vi.mock("wagmi", async () => {
  const actual = await vi.importActual("wagmi");
  return {
    ...actual,
    useAccount: vi.fn(),
    useBalance: vi.fn(),
    useWriteContract: vi.fn(),
    useWaitForTransactionReceipt: vi.fn()
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
const {
  useAccount,
  useBalance,
  useWriteContract,
  useWaitForTransactionReceipt
} = await import("wagmi");

describe("<SendTokens />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWriteContract.mockClear();
    mockRefetchUsdcBalance.mockClear();
    (toast.error as any).mockClear();
    (toast.success as any).mockClear();
    (toast.loading as any).mockClear();
    (toast.dismiss as any).mockClear();
  });

  it("should render the form with all required elements", () => {
    (useAccount as any).mockReturnValue({
      address: "0x1234567890123456789012345678901234567890",
      isConnected: true
    });
    (useBalance as any).mockReturnValue({
      data: { value: 1000000n }, // 1 USDC
      refetch: mockRefetchUsdcBalance
    });
    (useWriteContract as any).mockReturnValue({
      writeContract: mockWriteContract,
      isPending: false,
      error: null
    });
    (useWaitForTransactionReceipt as any).mockReturnValue({
      isLoading: false,
      isSuccess: false
    });

    renderWithProviders(<SendTokens />);

    expect(screen.getByText("Amount")).toBeInTheDocument();
    expect(screen.getByText("Send to")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("0")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Paste an Avalanche (C-Chain) address")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send" })).toBeInTheDocument();
  });

  it("should show USDC balance when connected", () => {
    (useAccount as any).mockReturnValue({
      address: "0x1234567890123456789012345678901234567890",
      isConnected: true
    });
    (useBalance as any).mockReturnValue({
      data: { value: 1000000n }, // 1 USDC
      refetch: mockRefetchUsdcBalance
    });
    (useWriteContract as any).mockReturnValue({
      writeContract: mockWriteContract,
      isPending: false,
      error: null
    });
    (useWaitForTransactionReceipt as any).mockReturnValue({
      isLoading: false,
      isSuccess: false
    });

    renderWithProviders(<SendTokens />);

    expect(screen.getByText("1 USDC")).toBeInTheDocument();
  });

  it("should validate recipient address format", async () => {
    (useAccount as any).mockReturnValue({
      address: "0x1234567890123456789012345678901234567890",
      isConnected: true
    });
    (useBalance as any).mockReturnValue({
      data: { value: 1000000n },
      refetch: mockRefetchUsdcBalance
    });
    (useWriteContract as any).mockReturnValue({
      writeContract: mockWriteContract,
      isPending: false,
      error: null
    });
    (useWaitForTransactionReceipt as any).mockReturnValue({
      isLoading: false,
      isSuccess: false
    });

    renderWithProviders(<SendTokens />);

    const recipientInput = screen.getByPlaceholderText(
      "Paste an Avalanche (C-Chain) address"
    );

    // Test invalid address
    fireEvent.change(recipientInput, { target: { value: "invalid-address" } });

    await waitFor(() => {
      expect(
        screen.getByText("Invalid Avalanche (C-Chain) address format")
      ).toBeInTheDocument();
    });
  });

  it("should prevent sending to own address", async () => {
    const userAddress = "0x1234567890123456789012345678901234567890";

    (useAccount as any).mockReturnValue({
      address: userAddress,
      isConnected: true
    });
    (useBalance as any).mockReturnValue({
      data: { value: 1000000n },
      refetch: mockRefetchUsdcBalance
    });
    (useWriteContract as any).mockReturnValue({
      writeContract: mockWriteContract,
      isPending: false,
      error: null
    });
    (useWaitForTransactionReceipt as any).mockReturnValue({
      isLoading: false,
      isSuccess: false
    });

    renderWithProviders(<SendTokens />);

    const recipientInput = screen.getByPlaceholderText(
      "Paste an Avalanche (C-Chain) address"
    );
    fireEvent.change(recipientInput, { target: { value: userAddress } });
    fireEvent.blur(recipientInput);

    await waitFor(() => {
      expect(screen.getByText("Cannot send to yourself")).toBeInTheDocument();
    });
  });

  it("should validate amount is greater than 0", async () => {
    (useAccount as any).mockReturnValue({
      address: "0x1234567890123456789012345678901234567890",
      isConnected: true
    });
    (useBalance as any).mockReturnValue({
      data: { value: 1000000n },
      refetch: mockRefetchUsdcBalance
    });
    (useWriteContract as any).mockReturnValue({
      writeContract: mockWriteContract,
      isPending: false,
      error: null
    });
    (useWaitForTransactionReceipt as any).mockReturnValue({
      isLoading: false,
      isSuccess: false
    });

    renderWithProviders(<SendTokens />);

    const amountInput = screen.getByPlaceholderText("0");

    // Test zero amount
    fireEvent.change(amountInput, { target: { value: "0" } });
    fireEvent.blur(amountInput);

    await waitFor(() => {
      expect(
        screen.getByText("Amount must be greater than 0")
      ).toBeInTheDocument();
    });

    // Test negative amount
    fireEvent.change(amountInput, { target: { value: "0" } });

    await waitFor(() => {
      expect(
        screen.getByText("Amount must be greater than 0")
      ).toBeInTheDocument();
    });
  });

  it("should validate amount does not exceed balance", async () => {
    (useAccount as any).mockReturnValue({
      address: "0x1234567890123456789012345678901234567890",
      isConnected: true
    });
    (useBalance as any).mockReturnValue({
      data: { value: 1000000n }, // 1 USDC
      refetch: mockRefetchUsdcBalance
    });
    (useWriteContract as any).mockReturnValue({
      writeContract: mockWriteContract,
      isPending: false,
      error: null
    });
    (useWaitForTransactionReceipt as any).mockReturnValue({
      isLoading: false,
      isSuccess: false
    });

    renderWithProviders(<SendTokens />);

    const amountInput = screen.getByPlaceholderText("0");
    fireEvent.change(amountInput, { target: { value: "2.0" } });
    fireEvent.blur(amountInput);

    await waitFor(() => {
      expect(
        screen.getByText("Insufficient balance. You have 1.000000 USDC")
      ).toBeInTheDocument();
    });
  });

  it("should handle percentage button clicks", async () => {
    (useAccount as any).mockReturnValue({
      address: "0x1234567890123456789012345678901234567890",
      isConnected: true
    });
    (useBalance as any).mockReturnValue({
      data: { value: 1000000n }, // 1 USDC
      refetch: mockRefetchUsdcBalance
    });
    (useWriteContract as any).mockReturnValue({
      writeContract: mockWriteContract,
      isPending: false,
      error: null
    });
    (useWaitForTransactionReceipt as any).mockReturnValue({
      isLoading: false,
      isSuccess: false
    });

    renderWithProviders(<SendTokens />);

    const percentage25Button = screen.getByText("25%");
    fireEvent.click(percentage25Button);

    await waitFor(() => {
      const amountInput = screen.getByPlaceholderText("0") as HTMLInputElement;
      expect(amountInput.value).toBe("0.250000");
    });
  });

  it("should handle max button click", async () => {
    (useAccount as any).mockReturnValue({
      address: "0x1234567890123456789012345678901234567890",
      isConnected: true
    });
    (useBalance as any).mockReturnValue({
      data: { value: 1000000n }, // 1 USDC
      refetch: mockRefetchUsdcBalance
    });
    (useWriteContract as any).mockReturnValue({
      writeContract: mockWriteContract,
      isPending: false,
      error: null
    });
    (useWaitForTransactionReceipt as any).mockReturnValue({
      isLoading: false,
      isSuccess: false
    });

    renderWithProviders(<SendTokens />);

    const maxButton = screen.getByText("Max");
    fireEvent.click(maxButton);

    await waitFor(() => {
      const amountInput = screen.getByPlaceholderText("0") as HTMLInputElement;
      expect(amountInput.value).toBe("1.000000");
    });
  });

  it("should disable send button when form is invalid", () => {
    (useAccount as any).mockReturnValue({
      address: "0x1234567890123456789012345678901234567890",
      isConnected: true
    });
    (useBalance as any).mockReturnValue({
      data: { value: 1000000n },
      refetch: mockRefetchUsdcBalance
    });
    (useWriteContract as any).mockReturnValue({
      writeContract: mockWriteContract,
      isPending: false,
      error: null
    });
    (useWaitForTransactionReceipt as any).mockReturnValue({
      isLoading: false,
      isSuccess: false
    });

    renderWithProviders(<SendTokens />);

    const sendButton = screen.getByRole("button", { name: "Send" });
    expect(sendButton).toBeDisabled();
  });

  it("should show loading state during transaction", () => {
    (useAccount as any).mockReturnValue({
      address: "0x1234567890123456789012345678901234567890",
      isConnected: true
    });
    (useBalance as any).mockReturnValue({
      data: { value: 1000000n },
      refetch: mockRefetchUsdcBalance
    });
    (useWriteContract as any).mockReturnValue({
      writeContract: mockWriteContract,
      isPending: true,
      error: null
    });
    (useWaitForTransactionReceipt as any).mockReturnValue({
      isLoading: false,
      isSuccess: false
    });

    renderWithProviders(<SendTokens />);

    expect(screen.getByText("Confirming...")).toBeInTheDocument();
  });
});
