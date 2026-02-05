"use client";

import React from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen flex items-center justify-center p-6">
          <div className="glass-card p-8 text-center max-w-md w-full">
            <div className="text-5xl mb-4">😵</div>
            <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
            <p className="text-[var(--foreground-muted)] mb-6">
              An unexpected error occurred. Try refreshing or click below to
              retry.
            </p>
            {this.state.error && (
              <p className="text-sm text-red-400 mb-4 font-mono break-all">
                {this.state.error.message}
              </p>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="secondary-button px-6 py-3"
              >
                Try Again
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                className="glow-button px-6 py-3"
              >
                Go Home
              </button>
            </div>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
