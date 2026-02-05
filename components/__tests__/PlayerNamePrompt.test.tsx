import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PlayerNamePrompt } from "../PlayerNamePrompt";

describe("PlayerNamePrompt", () => {
  it("renders the form with input and button", () => {
    render(<PlayerNamePrompt onSubmit={vi.fn()} />);

    expect(screen.getByPlaceholderText("Your name...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Join Game" })).toBeInTheDocument();
  });

  it("disables the submit button when input is empty", () => {
    render(<PlayerNamePrompt onSubmit={vi.fn()} />);

    const button = screen.getByRole("button", { name: "Join Game" });
    expect(button).toBeDisabled();
  });

  it("enables the submit button when input has text", async () => {
    const user = userEvent.setup();
    render(<PlayerNamePrompt onSubmit={vi.fn()} />);

    const input = screen.getByPlaceholderText("Your name...");
    await user.type(input, "Alice");

    const button = screen.getByRole("button", { name: "Join Game" });
    expect(button).toBeEnabled();
  });

  it("calls onSubmit with trimmed name on form submission", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<PlayerNamePrompt onSubmit={onSubmit} />);

    const input = screen.getByPlaceholderText("Your name...");
    await user.type(input, "  Alice  ");
    await user.click(screen.getByRole("button", { name: "Join Game" }));

    expect(onSubmit).toHaveBeenCalledWith("Alice");
  });

  it("does not call onSubmit with whitespace-only name", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<PlayerNamePrompt onSubmit={onSubmit} />);

    const input = screen.getByPlaceholderText("Your name...");
    await user.type(input, "   ");

    // Button should be disabled since trimmed value is empty
    const button = screen.getByRole("button", { name: "Join Game" });
    expect(button).toBeDisabled();

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("has maxLength of 100 on the input", () => {
    render(<PlayerNamePrompt onSubmit={vi.fn()} />);

    const input = screen.getByPlaceholderText("Your name...");
    expect(input).toHaveAttribute("maxLength", "100");
  });

  it("renders welcome heading", () => {
    render(<PlayerNamePrompt onSubmit={vi.fn()} />);

    expect(screen.getByText("Welcome!")).toBeInTheDocument();
    expect(screen.getByText("Enter your name to join the game")).toBeInTheDocument();
  });
});
