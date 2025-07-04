import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { CheckUserContext } from "./CheckUserToken";

export const FavoriteContext = createContext();

export const FavoriteProvider = ({ children }) => {
  const [favoriteItems, setFavoriteItems] = useState([]);
  const { isLoggedin } = useContext(CheckUserContext);
  const token = localStorage.getItem("authToken");

  // Fetch favorite items when the component mounts
  useEffect(() => {
    const fetchFavoriteItems = async () => {
      if (isLoggedin) {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_BACKEND_API}/favorites/get`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setFavoriteItems(response?.data); // Assuming response.data is the array of favorite items
        } catch (error) {
          console.error("Error fetching favorite items:", error);
        }
      }
    };

    fetchFavoriteItems();
  }, [setFavoriteItems, isLoggedin]);

  return (
    <FavoriteContext.Provider value={{ favoriteItems, setFavoriteItems }}>
      {children}
    </FavoriteContext.Provider>
  );
};
