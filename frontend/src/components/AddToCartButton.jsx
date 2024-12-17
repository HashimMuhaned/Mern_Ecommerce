import React, { useContext } from "react";
import axios from "axios";
import { CheckUserContext } from "../context/CheckUserToken";
import { CartContext } from "../context/CartContext";

const AddToCartButton = ({ productId, quantity, sizeChosen }) => {
  const { isLoggedin } = useContext(CheckUserContext);
  const { setCartItems } = useContext(CartContext); // Access CartContext to update items
  const token = localStorage.getItem("authToken");

  const handleAddToCart = async () => {
    if (!isLoggedin) {
      alert("You need to be logged in to add items to the cart.");
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.BACKEND_API}/cart/add`,
        { productId, quantity, sizeChosen },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // If the item is successfully added, update the cart items
      setCartItems(response.data.items); // Update cartItems in the CartContext
      alert("Item added to cart");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add item to cart.");
    }
  };

  return <button onClick={handleAddToCart}>Add to Cart</button>;
};

export default AddToCartButton;
