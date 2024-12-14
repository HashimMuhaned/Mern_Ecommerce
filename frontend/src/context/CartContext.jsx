import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { CheckUserContext } from "./CheckUserToken";


export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const totalCartCost = cartItems
    ? cartItems
        .reduce(
          (acc, item) => acc + item.productId.price * item.quantity,
          0 // initial value for accumulator
        )
        .toFixed(2)
    : null;
  const { isLoggedin } = useContext(CheckUserContext);

  useEffect(() => {
    const fetchCartItems = async () => {
      if (isLoggedin) {
        try {
          const response = await axios.get(`${process.env.BACKEND_API}/cart`, {
            withCredentials: true,
          });
          setCartItems(response.data.items);
        } catch (error) {
          console.error("Error fetching cart items:", error);
        }
      }
    };
    fetchCartItems();
  }, [isLoggedin, cartItems]);

  // Function to clear the cart both locally and on the server
  const clearCart = async (buyer) => {
    try {
      await axios.delete(`${process.env.BACKEND_API}/cart`, buyer, {
        withCredentials: true,
      });
      setCartItems([]); // Clear the cart locally
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  return (
    <CartContext.Provider
      value={{ cartItems, setCartItems, totalCartCost, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};
