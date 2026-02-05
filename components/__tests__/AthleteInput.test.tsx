import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AthleteInput } from "../AthleteInput";

// Mock Convex hooks
vi.mock("convex/react", () => ({
  useMutation: () => vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock("@/convex/_generated/api", () => ({
  api: {
    athletes: {
      add: "athletes:add",
    },
  },
}));

describe("AthleteInput", () => {
  const defaultProps = {
    gameId: "test-game-id" as never,
    playerName: "Alice",
    disabled: false,
  };

  it("renders the input and add button", () => {
    render(<AthleteInput {...defaultProps} />);

    expect(screen.getByPlaceholderText("Enter athlete name...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
  });

  it("disables the button when input is empty", () => {
    render(<AthleteInput {...defaultProps} />);

    const button = screen.getByRole("button", { name: "Add" });
    expect(button).toBeDisabled();
  });

  it("enables the button when input has text", async () => {
    const user = userEvent.setup();
    render(<AthleteInput {...defaultProps} />);

    const input = screen.getByPlaceholderText("Enter athlete name...");
    await user.type(input, "LeBron James");

    const button = screen.getByRole("button", { name: "Add" });
    expect(button).toBeEnabled();
  });

  it("disables input and button when disabled prop is true", () => {
    render(<AthleteInput {...defaultProps} disabled={true} />);

    const input = screen.getByPlaceholderText("Enter athlete name...");
    const button = screen.getByRole("button", { name: "Add" });

    expect(input).toBeDisabled();
    expect(button).toBeDisabled();
  });

  it("clears input after successful submission", async () => {
    const user = userEvent.setup();
    render(<AthleteInput {...defaultProps} />);

    const input = screen.getByPlaceholderText("Enter athlete name...");
    await user.type(input, "LeBron James");
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(input).toHaveValue("");
  });

  it("shows error message when mutation fails", async () => {
    // Override mock to reject
    const mockMutation = vi.fn().mockRejectedValue(new Error("Already entered!"));
    vi.mocked(await import("convex/react")).useMutation = () => mockMutation;

    const user = userEvent.setup();
    render(<AthleteInput {...defaultProps} />);

    const input = screen.getByPlaceholderText("Enter athlete name...");
    await user.type(input, "LeBron James");
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(await screen.findByText("Already entered!")).toBeInTheDocument();
  });
});
