import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { CartProvider } from './contexts/CartContext'; // <-- ADD THIS
import './styles/main.scss';

const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <CartProvider> {/* <-- WRAP YOUR APP HERE */}
        <App />
      </CartProvider>
    </BrowserRouter>
  </React.StrictMode>
);