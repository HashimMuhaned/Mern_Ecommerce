import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { CheckUserContext } from "./CheckUserToken";
require("dotenv").config();

export const FavoriteContext = createContext();

export const FavoriteProvider = ({ children }) => {
  const [favoriteItems, setFavoriteItems] = useState([]);
  const { isLoggedin } = useContext(CheckUserContext);

  // Fetch favorite items when the component mounts
  useEffect(() => {
    const fetchFavoriteItems = async () => {
      if (isLoggedin) {
        try {
          const response = await axios.get(`${process.env.BACKEND_API}/favorites/get`, {
            withCredentials: true,
          });
          setFavoriteItems(response.data); // Assuming response.data is the array of favorite items
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
