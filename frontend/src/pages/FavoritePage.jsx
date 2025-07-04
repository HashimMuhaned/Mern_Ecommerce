import React, { useContext, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { CheckUserContext } from "../context/CheckUserToken";
import { FavoriteContext } from "../context/FavoriteContext";
import ItemCard from "../components/ItemCard";
import axios from "axios";
import Spinners from "../components/Spinners";
import emptyFavPage from "../assets/EmptyPagesImages/empty_fav_page1.png";

const FavoritePage = () => {
  const { isLoggedin } = useContext(CheckUserContext);
  const { favoriteItems, setFavoriteItems } = useContext(FavoriteContext);
  const [loading, setLoading] = useState(true); // Add a loading state
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchFavoriteItems = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_API}/favorites/get`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setFavoriteItems(response?.data);
      } catch (error) {
        console.error("Error fetching favorite items:", error);
      } finally {
        setLoading(false); // Stop loading once the items are fetched
      }
    };

    fetchFavoriteItems();
  }, [setFavoriteItems]);

  useEffect(() => {
    console.log("favoriteItems state:", favoriteItems);
  }, [favoriteItems]);

  if (!isLoggedin) {
    return (
      <p id="login_to_view">
        Please{" "}
        <NavLink
          to={"/ethereal/login"}
          style={{ color: "blue", textDecoration: "underline" }}
        >
          Login to view your Favorites.
        </NavLink>
      </p>
    );
  }

  if (loading) {
    return <Spinners />;
  }

  return (
    <div>
      {favoriteItems?.length === 0 ? (
        <h2
          style={{ display: "flex", justifyContent: "center", padding: "20px" }}
        >
          Your Favorite Items Will appear here
        </h2>
      ) : (
        <h2
          style={{ display: "flex", justifyContent: "center", padding: "20px" }}
        >
          Your Favorite Items
        </h2>
      )}
      {favoriteItems?.length > 0 ? (
        <section id="best_seller_section" style={{ paddingBottom: "30px" }}>
          <div id="itemsCard">
            {favoriteItems?.map((item) => (
              <ItemCard key={item?._id} item={item} />
            ))}
          </div>
        </section>
      ) : (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <p id="no_favorite_items">NO favorite Items</p>
          <img
            id="empty_fav_page"
            src={emptyFavPage}
            alt="Empty Favorite Page"
            style={{ width: "40%", height: "500px" }}
          />
        </div>
      )}
    </div>
  );
};

export default FavoritePage;
