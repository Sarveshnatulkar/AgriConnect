import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster, ToastBar, toast } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { WishlistProvider } from "./context/WishlistContext";
import App from "./App";
import "./index.css";

/**
 * Application entry point.
 *
 * Provider order:
 *  1. BrowserRouter    — must wrap everything using React Router hooks
 *  2. AuthProvider     — session state
 *  3. WishlistProvider — per-user localStorage wishlist
 *  4. Toaster          — toast notifications, survives route transitions
 *
 * Toast customisation:
 *  - ToastBar render prop preserves the default icon + message layout
 *  - A ✕ close button is appended to every toast
 *  - Auto-dismiss is set to 3.5 s
 */
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
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
                    {/* Dismiss button — visible on every toast */}
                    <button
                      type="button"
                      onClick={() => toast.dismiss(t.id)}
                      style={{
                        background:  "transparent",
                        border:      "none",
                        cursor:      "pointer",
                        color:       "#9ca3af",
                        fontSize:    "18px",
                        lineHeight:  1,
                        padding:     "0 4px",
                        marginLeft:  "4px",
                        flexShrink:  0,
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
    </BrowserRouter>
  </React.StrictMode>
);
