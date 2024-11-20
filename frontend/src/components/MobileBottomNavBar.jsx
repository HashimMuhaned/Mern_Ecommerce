import React, { useContext, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { CgProfile } from "react-icons/cg";
import { RiShoppingCart2Line } from "react-icons/ri";
import { IoHeartOutline } from "react-icons/io5";
import { useEffect } from "react";
// import axios from "axios";
import { CheckUserContext } from "../context/CheckUserToken";
import { CartContext } from "../context/CartContext";
import { IoHomeOutline } from "react-icons/io5";

const MobileBottomNavBar = () => {
  const { isLoggedin } = useContext(CheckUserContext);
  const { cartItems } = useContext(CartContext);
  const cartItemsNumber = cartItems ? cartItems.length : null;

  useEffect(() => {
    cartItemsNumber + 1;
  }, [cartItems]);

  const ActiveLinkeHighLight = (isActive) => {
    return isActive ? "active-link-icon" : "inactive-link-icon";
  };

  return (
    <div id="mobile-navbar">
      <NavLink
        to={"/ethereal"}
        className={({ isActive }) => ActiveLinkeHighLight(isActive)}
        end
      >
        <IoHomeOutline />
      </NavLink>
      <NavLink
        to={"/ethereal/profile/settings"}
        className={({ isActive }) => ActiveLinkeHighLight(isActive)}
      >
        <CgProfile id="profileIconMobile" />
      </NavLink>
      <NavLink
        to={"/ethereal/favorites"}
        className={({ isActive }) => ActiveLinkeHighLight(isActive)}
      >
        <IoHeartOutline id="wishListIconMobile" />
      </NavLink>
      <NavLink
        to="/ethereal/cart"
        className={({ isActive }) => ActiveLinkeHighLight(isActive)}
      >
        <RiShoppingCart2Line id="cartIconMobile" />
        {isLoggedin ? (
          <div style={{ position: "relative" }}>
            {cartItemsNumber > 0 && (
              <span
                id="cartItemsNumberMobile"
                style={{
                  position: "absolute",
                  top: "-45px",
                  right: "-10px",
                  backgroundColor: "red",
                  borderRadius: "50%",
                  padding: "3px 7px",
                  color: "white",
                  fontSize: "12px",
                }}
              >
                {cartItemsNumber}
              </span>
            )}
          </div>
        ) : null}
      </NavLink>
    </div>
  );
};

export default MobileBottomNavBar;
