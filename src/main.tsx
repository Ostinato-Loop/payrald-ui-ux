// PayRald — App entry point
// AuthProvider uses in-memory JWT storage only (no localStorage).
// LILCKY STUDIO LIMITED

import React from "react";
import ReactDOM from "react-dom/client";
import { AuthProvider } from "./lib/auth";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);
