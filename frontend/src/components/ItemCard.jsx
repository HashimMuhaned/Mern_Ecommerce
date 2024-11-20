import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import AddToFavoriteButton from "./AddToFavoriteButton";
import { useLocation } from "react-router-dom";
import DeleteYourItemButton from "../components/DeleteYourItemButton";
import axios from "axios";

const ItemCard = ({ item }) => {
  const location = useLocation(); // Get the current location
  const navigate = useNavigate();

  const ItemsAnalysisPage = `/ethereal/profile/item-analysis`;
  const ProductURL = `/ethereal/categories/${item.category}/${item._id}`;

  return (
    <div>
      <div id="product1" className="section-1 pro-container">
        <NavLink
          className={`pro ${
            location.pathname === "/ethereal/profile/yourItems"
              ? "itemCardInsideYourItemsPage"
              : location.pathname === "/ethereal/profile/item-analysis"
              ? "itemCardInsideAnalysePage"
              : " "
          }`}
          to={
            location.pathname === ItemsAnalysisPage
              ? `/ethereal/profile/item-analysis/dashboard/${item._id}`
              : ProductURL
          }
          onClick={
            location.pathname !== "/cart" &&
            location.pathname !== "/favorites" &&
            location.pathname !== "/ethereal/profile/yourItems"
              ? async () => {
                  try {
                    await axios.patch(`/api/increment-views/${item._id}`);
                  } catch (error) {
                    console.error("Error incrementing views", error);
                  }
                }
              : null
          }
        >
          <img src={item.image1} alt={item.name} id="itemCardImage" />
          <div className="des">
            <h5>
              {item.name.length > 30
                ? item.name.slice(0, 30) + "..."
                : item.name}
            </h5>
            <h4>${item.price}</h4>
          </div>
        </NavLink>
        {location.pathname === "/ethereal/profile/yourItems" ? (
          <div id="Edit_delete_ItemCard">
            <button
            id="editItemButton"
              style={{
                backgroundColor: "green",
                border: "none",
                padding: "10px",
                color: "white",
                borderRadius: "8px",
                marginTop: "10px",
                cursor: "pointer",
              }}
              onClick={() =>
                navigate(`/ethereal/profile/edit-your-Item/${item._id}`)
              }
            >
              Edit Item
            </button>
            <DeleteYourItemButton productId={item._id} id="deleteItemButton"/>
          </div>
        ) : location.pathname === "/ethereal/profile/item-analysis" ? (
          <NavLink
            to={
              location.pathname === ItemsAnalysisPage
                ? `/ethereal/profile/item-analysis/dashboard/${item._id}`
                : ProductURL
            }
            id="whishListIcon"
            style={{
              fontSize: "15px",
              color: "white",
              border: "none",
              borderRadius: "4px",
              padding: "7px",
              backgroundColor: "skyblue",
            }}
          >
            Analyse this Item
          </NavLink>
        ) : (
          <AddToFavoriteButton productId={item._id} id="whishListIcon" />
        )}
      </div>
    </div>
  );
};
export default ItemCard;
