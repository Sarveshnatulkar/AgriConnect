import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster, ToastBar, toast } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { WishlistProvider } from "./context/WishlistContext";
import ErrorBoundary from "./components/common/ErrorBoundary";
import App from "./App";
import "./index.css";

/**
 * Application entry point.
 *
 * Provider order:
 *  1. BrowserRouter    — router context (must be outermost)
 *  2. ErrorBoundary    — catches render crashes, shows friendly fallback
 *  3. AuthProvider     — global auth state (JWT cookie rehydration)
 *  4. WishlistProvider — per-user localStorage wishlist
 *  5. Toaster          — toast notifications (survives route transitions)
 *
 * Toast customisation:
 *  - ToastBar render prop preserves default icon + message layout
 *  - ✕ close button appended to every notification
 *  - Auto-dismiss at 3.5 s
 */
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <WishlistProvider>
            <App />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3500,
                style: {
                  borderRadius: "8px",
                  fontSize:     "14px",
                  fontFamily:   "Inter, system-ui, sans-serif",
                  maxWidth:     "380px",
                },
                success: {
                  iconTheme: { primary: "#16a34a", secondary: "#ffffff" },
                },
                error: {
                  iconTheme: { primary: "#dc2626", secondary: "#ffffff" },
                },
              }}
            >
              {(t) => (
                <ToastBar toast={t}>
                  {({ icon, message }) => (
                    <>
                      {icon}
                      {message}
                      <button
                        type="button"
                        onClick={() => toast.dismiss(t.id)}
                        style={{
                          background: "transparent",
                          border:     "none",
                          cursor:     "pointer",
                          color:      "#9ca3af",
                          fontSize:   "18px",
                          lineHeight: 1,
                          padding:    "0 4px",
                          marginLeft: "4px",
                          flexShrink: 0,
                        }}
                        aria-label="Dismiss notification"
                      >
                        ✕
                      </button>
                    </>
                  )}
                </ToastBar>
              )}
            </Toaster>
          </WishlistProvider>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>
);
