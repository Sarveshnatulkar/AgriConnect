import { Component } from "react";
import { MdOutlineAgriculture } from "react-icons/md";
import { HiOutlineRefresh, HiOutlineHome } from "react-icons/hi";

/**
 * ErrorBoundary — catches any React render error in the subtree and
 * shows a friendly fallback screen instead of a white blank page.
 *
 * Usage (in main.jsx):
 *   <ErrorBoundary>
 *     <App />
 *   </ErrorBoundary>
 *
 * Must be a class component — React error boundaries cannot be
 * written as function components (as of React 18).
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log to console in development; swap for a real error tracking
    // service (Sentry, Datadog, etc.) in production.
    if (import.meta.env.DEV) {
      console.error("[ErrorBoundary]", error, info.componentStack);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleHome = () => {
    // Reset boundary state then navigate home via full reload
    // (using full reload ensures the boundary resets cleanly)
    window.location.href = "/";
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center
                      text-center px-4 py-16">

        {/* Illustration */}
        <div className="relative mb-8 select-none">
          <div className="w-24 h-24 rounded-full bg-red-50 border-4 border-red-100 shadow-md
                          flex items-center justify-center">
            <MdOutlineAgriculture className="text-5xl text-red-400" />
          </div>
          {/* Subtle pulsing ring */}
          <div className="absolute inset-0 rounded-full border-2 border-red-100 scale-125 opacity-40
                          animate-ping" aria-hidden="true" style={{ animationDuration: "2s" }} />
        </div>

        {/* Message */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          Something went wrong
        </h1>
        <p className="text-gray-500 max-w-md text-base leading-relaxed mb-2">
          An unexpected error occurred. This has been noted. Please reload the
          page or return to the home page.
        </p>

        {/* Error detail — dev only */}
        {import.meta.env.DEV && this.state.error && (
          <pre className="mt-4 mb-6 max-w-lg w-full text-left text-xs bg-gray-900 text-red-300
                          rounded-xl px-4 py-3 overflow-x-auto font-mono">
            {this.state.error.message}
          </pre>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          <button
            type="button"
            onClick={this.handleReload}
            className="btn-primary flex items-center gap-2"
          >
            <HiOutlineRefresh className="text-base" />
            Reload Page
          </button>
          <button
            type="button"
            onClick={this.handleHome}
            className="btn-secondary flex items-center gap-2"
          >
            <HiOutlineHome className="text-base" />
            Go Home
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
