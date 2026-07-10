import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { WishlistProvider } from "./context/WishlistContext";
import App from "./App";
import "./index.css";

/**
 * Application entry point.
 *
 * Provider order:
 *  1. BrowserRouter    — must wrap everything using React Router hooks
 *  2. AuthProvider     — session state, used by WishlistProvider indirectly
 *  3. WishlistProvider — localStorage wishlist, available to all components
 *  4. Toaster          — toast notifications, survives route transitions
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
              duration: 4000,
              style: {
                borderRadius: "8px",
                fontSize:     "14px",
                fontFamily:   "Inter, system-ui, sans-serif",
              },
              success: {
                iconTheme: {
                  primary: "#16a34a",
                  secondary: "#ffffff",
                },
              },
              error: {
                iconTheme: {
                  primary: "#dc2626",
                  secondary: "#ffffff",
                },
              },
            }}
          />
        </WishlistProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
