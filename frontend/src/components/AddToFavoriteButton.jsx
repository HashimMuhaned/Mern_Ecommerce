import React, { useContext, useState, useEffect } from "react";
import { FavoriteContext } from "../context/FavoriteContext";
import axios from "axios";
import { IoHeartOutline, IoHeart } from "react-icons/io5";

const AddToFavoriteButton = ({ productId }) => {
  const { favoriteItems, setFavoriteItems } = useContext(FavoriteContext);
  const [isFavorite, setIsFavorite] = useState(false);
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    setIsFavorite(favoriteItems.some((item) => item._id === productId));
  }, [favoriteItems, productId]);

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        // Remove from favorites
        const response = await axios.post(
          `${process.env.BACKEND_API}/favorites/add`,
          { productId }, // Payload
          {
            headers: {
              Authorization: `Bearer ${token}`, // Send token in the header
            },
          }
        );
        setFavoriteItems((prevItems) =>
          prevItems.filter((item) => item._id !== productId)
        );
      } else {
        // Add to favorites
        const response = await axios.post(
          `${process.env.BACKEND_API}/favorites/add`,
          { productId },
          {
            headers: {
              Authorization: `Bearer ${token}`, // Send token in the header
            },
          }
        );

        setFavoriteItems((prevItems) => [
          ...prevItems,
          {
            _id: productId,
            name: response.data.name,
            price: response.data.price,
            itemImg: response.data.itemImg,
            category: response.data.category,
          },
        ]);
      }
    } catch (error) {
      console.error("Error updating favorite status:", error);
    }
  };

  return (
    <div onClick={toggleFavorite} id="whishListIcon">
      {isFavorite ? (
        <IoHeart color="red" size={30} />
      ) : (
        <IoHeartOutline size={30} />
      )}
    </div>
  );
};

export default AddToFavoriteButton;
