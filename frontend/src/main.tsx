import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ReactKeycloakProvider } from "@react-keycloak/web";
import { QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { CartProvider } from "./contexts/CartContext";
import { queryClient } from "./lib/queryClient";
import MockKeycloakProvider from "./contexts/MockKeycloakProvider";
import "./styles/main.scss";

const root = ReactDOM.createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <CartProvider>
        {" "}
        {/* <-- WRAP YOUR APP HERE */}
        <App />
      </CartProvider>
    </BrowserRouter>
  </React.StrictMode>
);
