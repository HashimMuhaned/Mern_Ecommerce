import React, { useContext, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { CgProfile } from "react-icons/cg";
import { RiShoppingCart2Line } from "react-icons/ri";
import { IoHeartOutline } from "react-icons/io5";
import { FaSearch } from "react-icons/fa";
import { useEffect } from "react";
// import axios from "axios";
import { Fragment } from "react";
import { CheckUserContext } from "../context/CheckUserToken";
import { CartContext } from "../context/CartContext";
import { GiHamburgerMenu } from "react-icons/gi";
import { HiXMark } from "react-icons/hi2";
import ConfirmWindow from "../components/ConfirmWindow";
import { toast } from "react-toastify";

const NavBar = () => {
  const { isLoggedin, handleSignOut } = useContext(CheckUserContext);
  const { cartItems } = useContext(CartContext);
  const [suggestions, setSuggestions] = useState([]);
  const cartItemsNumber = cartItems ? cartItems.length : null;

  const [inputValue, setInputValue] = useState("");
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const token = localStorage.getItem("authToken");

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Redirect to the AllItems page and append the search query to the URL
    navigate(`/ethereal/all?search=${encodeURIComponent(inputValue)}`);
    inputValue && setInputValue("");
  };

  const ActiveLinkeHighLight = (isActive) => {
    return isActive ? "active-link" : "inactive-link";
  };

  const fetchSuggestions = async (query) => {
    // Replace with actual API call or filtering logic
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_API}/suggestions?query=${query}`
    );
    const data = await response.json();
    setSuggestions(data);
  };

  useEffect(() => {
    if (inputValue) {
      fetchSuggestions(inputValue);
    } else {
      setSuggestions([]);
    }
  }, [inputValue]);

  useEffect(() => {
    cartItemsNumber + 1;
  }, [cartItems]);

  const ActiveLinkeHighLightIcons = (isActive) => {
    return isActive ? "active-link-icon" : "inactive-link-icon";
  };

  return (
    <nav id="navbar">
      <NavLink id="Logo" className="baskervville-sc-regular" to="/ethereal">
        Ethereal.
      </NavLink>
      <div>
        <ul id="mininavbar">
          <li>
            <NavLink
              to="/ethereal"
              className={({ isActive }) => ActiveLinkeHighLight(isActive)}
              end
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/ethereal/categories"
              className={({ isActive }) => ActiveLinkeHighLight(isActive)}
            >
              Categories
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/ethereal/all"
              className={({ isActive }) => ActiveLinkeHighLight(isActive)}
            >
              All
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/ethereal/contact"
              className={({ isActive }) => ActiveLinkeHighLight(isActive)}
            >
              Contact
            </NavLink>
          </li>
        </ul>
      </div>
      <div id="navIcons">
        <div id="search">
          <form id="search_form" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="search items"
              id="search_Input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              autoComplete="off"
            />
            <FaSearch id="search_icon" />
            {suggestions.length > 0 && (
              <ul className="suggestions-list">
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    onClick={() => {
                      setInputValue(suggestion); // Set input value
                      handleSearchSubmit({ preventDefault: () => {} }); //Calls the search function while preventing the default form submission behavior.
                    }}
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </form>
        </div>
        {isLoggedin ? (
          <Fragment>
            <NavLink
              id="navIcon"
              to={"/ethereal/profile/settings"}
              className={({ isActive }) => ActiveLinkeHighLightIcons(isActive)}
              end
            >
              <CgProfile id="profileIcon" />
            </NavLink>
            <NavLink
              id="navIcon"
              to={"/ethereal/favorites"}
              className={({ isActive }) => ActiveLinkeHighLightIcons(isActive)}
              end
            >
              <IoHeartOutline id="wishListIcon" />
            </NavLink>
            <NavLink
              id="navIcon"
              to="/ethereal/cart"
              className={({ isActive }) => ActiveLinkeHighLightIcons(isActive)}
              end
            >
              <div style={{ position: "relative" }}>
                <RiShoppingCart2Line id="cartIcon" />
                {cartItemsNumber > 0 && (
                  <span
                    id="cartItemsNumber"
                    style={{
                      position: "absolute",
                      top: "-12px",
                      right: "-10px",
                      backgroundColor: "red",
                      borderRadius: "50%",
                      padding: "5px 8px",
                      color: "white",
                      fontSize: "12px",
                    }}
                  >
                    {cartItemsNumber}
                  </span>
                )}
              </div>
            </NavLink>
          </Fragment>
        ) : (
          <Fragment>
            <NavLink id="loginBTN" to="/ethereal/login">
              Login
            </NavLink>
            <NavLink id="signupBTN" to="/ethereal/signup">
              Sign Up
            </NavLink>
          </Fragment>
        )}
        {isSidebarOpen ? (
          <HiXMark onClick={closeSidebar} id="x-mark" />
        ) : (
          <GiHamburgerMenu
            onClick={toggleSidebar}
            className="hamburger-icon"
            id="humburgerMenu"
          />
        )}
      </div>
      <div id="sidebar" className={isSidebarOpen ? "sidebar-open" : ""}>
        <div id="sidebar-content">
          <ul id="sidebar-links">
            <li>
              <NavLink to="/ethereal" onClick={closeSidebar} end>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/ethereal/categories" onClick={closeSidebar}>
                Categories
              </NavLink>
            </li>
            <li>
              <NavLink to="/ethereal/all" onClick={closeSidebar}>
                All
              </NavLink>
            </li>
            <li>
              <NavLink to="/ethereal/contact" onClick={closeSidebar}>
                Contact
              </NavLink>
            </li>
            {isLoggedin ? (
              <button
                onClick={() => setShowModal(true)}
                style={{
                  width: "120px",
                  borderRadius: "4px",
                  backgroundColor: "red",
                  color: "white",
                  height: "30px",
                  border: "none",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                Sign Out
              </button>
            ) : (
              <div>
                <li>
                  <NavLink to="/ethereal/login" onClick={closeSidebar}>
                    Login
                  </NavLink>
                </li>
                <li style={{ marginTop: "20px" }}>
                  <NavLink to="/ethereal/signup" onClick={closeSidebar}>
                    Sign Up
                  </NavLink>
                </li>
              </div>
            )}
          </ul>
        </div>
      </div>

      <ConfirmWindow
        show={showModal}
        message="Are you sure you want to sign out?"
        onConfirm={() => handleSignOut(toast, navigate)}
        onCancel={() => setShowModal(false)}
      />
    </nav>
  );
};

export default NavBar;
