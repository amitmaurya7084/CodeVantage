import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { AdminAuthProvider } from "./context/AdminAuthContext.jsx";
import { BrandingProvider } from "./context/BrandingContext.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <BrandingProvider>
          <AuthProvider>
            <AdminAuthProvider>
              <App />
              <Toaster position="top-right" />
            </AdminAuthProvider>
          </AuthProvider>
        </BrandingProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);
