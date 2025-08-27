import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WagmiProvider } from "wagmi";
import { config } from "../lib/wagmiConfig";
import { Connect } from "./Connect";

// Mock wagmi hooks
const mockDisconnect = vi.fn();
const mockConnect = vi.fn();

vi.mock("wagmi", async () => {
  const actual = await vi.importActual("wagmi");
  return {
    ...actual,
    useAccount: () => ({
      address: "0x1234567890123456789012345678901234567890",
      isConnected: true
    }),
    useConnect: () => ({
      connect: mockConnect,
      isPending: false
    }),
    useDisconnect: () => ({
      disconnect: mockDisconnect
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

describe("Connect", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the title and subtitle", () => {
    renderWithProviders(<Connect />);

    expect(screen.getByText("Send tokens")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Send tokens to any address or contact on a given network."
      )
    ).toBeInTheDocument();
  });

  it("displays connected wallet address", () => {
    renderWithProviders(<Connect />);

    expect(screen.getByText("Connected:")).toBeInTheDocument();
    expect(screen.getByText("0x1234...7890")).toBeInTheDocument();
  });

  it("shows disconnect button when connected", () => {
    renderWithProviders(<Connect />);

    expect(
      screen.getByRole("button", { name: "Disconnect" })
    ).toBeInTheDocument();
  });

  it("calls disconnect when disconnect button is clicked", () => {
    renderWithProviders(<Connect />);

    const disconnectButton = screen.getByRole("button", { name: "Disconnect" });
    fireEvent.click(disconnectButton);

    expect(mockDisconnect).toHaveBeenCalledTimes(1);
  });
});
