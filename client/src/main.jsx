import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

/**
 * Application entry point.
 *
 * BrowserRouter is placed here (not inside App) so the entire component tree
 * has access to routing context. Context providers added in later phases
 * (AuthContext, NotificationContext, etc.) will also wrap App here.
 */
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
