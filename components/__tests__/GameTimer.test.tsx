import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { GameTimer } from "../GameTimer";

describe("GameTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders without crashing", () => {
    const now = Date.now();
    vi.setSystemTime(now);

    const { container } = render(
      <GameTimer expiresAt={now + 60000} />
    );

    // Should render something (either placeholder or time)
    expect(container.textContent).toBeTruthy();
  });

  it("shows correct time format after mounting", () => {
    const now = Date.now();
    vi.setSystemTime(now);

    render(<GameTimer expiresAt={now + 125000} />); // 2 min 5 sec

    // Trigger useEffect by advancing timers
    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(screen.getByText("2:05")).toBeInTheDocument();
  });

  it("shows Time's up! when expired", () => {
    const now = Date.now();
    vi.setSystemTime(now);

    render(<GameTimer expiresAt={now - 1000} />); // already expired

    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(screen.getByText("Time's up!")).toBeInTheDocument();
  });

  it("counts down over time", () => {
    const now = Date.now();
    vi.setSystemTime(now);

    render(<GameTimer expiresAt={now + 65000} />); // 1 min 5 sec

    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(screen.getByText("1:05")).toBeInTheDocument();

    // Advance 5 seconds
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.getByText("1:00")).toBeInTheDocument();
  });

  it("applies warning styles when under 60 seconds", () => {
    const now = Date.now();
    vi.setSystemTime(now);

    render(<GameTimer expiresAt={now + 30000} />); // 30 sec

    act(() => {
      vi.advanceTimersByTime(0);
    });

    const timerElement = screen.getByText("0:30");
    expect(timerElement.className).toContain("text-orange-400");
    expect(timerElement.className).toContain("animate-pulse");
  });

  it("applies success styles when over 60 seconds", () => {
    const now = Date.now();
    vi.setSystemTime(now);

    render(<GameTimer expiresAt={now + 120000} />); // 2 min

    act(() => {
      vi.advanceTimersByTime(0);
    });

    const timerElement = screen.getByText("2:00");
    expect(timerElement.className).toContain("text-[var(--success)]");
  });
});
