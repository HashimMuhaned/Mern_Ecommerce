import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { DataProvider } from "./context/DataContext.jsx";
import { CheckUserProvider } from "./context/CheckUserToken.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { FavoriteProvider } from "./context/FavoriteContext.jsx";
import { ToastProvider } from "./context/ToastContext";
import { YourItemsProvider } from "./context/YourItemsContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <DataProvider>
      <CheckUserProvider>
        <CartProvider>
          <FavoriteProvider>
            <YourItemsProvider>
              <ToastProvider>
                <App />
              </ToastProvider>
            </YourItemsProvider>
          </FavoriteProvider>
        </CartProvider>
      </CheckUserProvider>
    </DataProvider>
  </React.StrictMode>
);
