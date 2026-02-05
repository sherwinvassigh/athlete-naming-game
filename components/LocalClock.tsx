"use client";

import { useState, useEffect } from "react";

export function LocalClock() {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      setTime(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Show placeholder during SSR to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="text-xs text-[var(--foreground-subtle)]">
        <span className="font-mono">--:--:--</span>
      </div>
    );
  }

  return (
    <div className="text-xs text-[var(--foreground-subtle)]">
      <span className="font-mono">{time || "--:--:--"}</span>
    </div>
  );
}
