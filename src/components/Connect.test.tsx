import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Connect } from "./Connect";

describe("<Connect />", () => {
  it("should render the app header with title and subtitle", () => {
    render(<Connect />);

    expect(screen.getByText("Send Tokens")).toBeInTheDocument();
    expect(
      screen.getByText("Send USDC to any address on the Fuji network")
    ).toBeInTheDocument();
  });

  it("should have the correct heading structure", () => {
    render(<Connect />);

    const title = screen.getByRole("heading", { level: 1 });
    expect(title).toHaveTextContent("Send Tokens");
  });

  it("should display the subtitle as a paragraph", () => {
    render(<Connect />);

    const subtitle = screen.getByText(
      "Send USDC to any address on the Fuji network"
    );
    expect(subtitle.tagName).toBe("P");
  });
});
