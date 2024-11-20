import React from "react";
import { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { CheckUserContext } from "./CheckUserToken";

export const YourItemsContext = createContext();

export const YourItemsProvider = ({ children }) => {
  const [yourItems, setYourItems] = useState([]);
  const { isLoggedin } = useContext(CheckUserContext);

  useEffect(() => {
    const fetchYourItems = async () => {
      if (isLoggedin) {
        try {
          const res = await axios.get("/api/yourItems/get", {
            withCredentials: true,
          });
          setYourItems(res.data);
        } catch (error) {
          console.log("Error getting Your Items", error);
        }
      }
    };
    fetchYourItems();
  }, [isLoggedin]);

  return (
    <YourItemsContext.Provider value={{ yourItems, setYourItems }}>
      {children}
    </YourItemsContext.Provider>
  );
};
