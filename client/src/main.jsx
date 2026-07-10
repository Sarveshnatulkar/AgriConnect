import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import App from "./App";
import "./index.css";

/**
 * Application entry point.
 *
 * Provider order matters:
 *  1. BrowserRouter — must wrap everything that uses React Router hooks
 *     (AuthContext uses useNavigate, so BrowserRouter must be outside it)
 *  2. AuthProvider  — wraps App so every component can call useAuth()
 *  3. Toaster       — renders toast notifications at the root level
 *     (outside App so toasts survive route transitions)
 *
 * Toaster config:
 *  - position: top-right (conventional for web apps)
 *  - duration: 4000ms (enough time to read, not too intrusive)
 *  - success/error styles match the AgriConnect green/red brand palette
 */
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
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
                primary: "#16a34a",   // primary-600
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
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
