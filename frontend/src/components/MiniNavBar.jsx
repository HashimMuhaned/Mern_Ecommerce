import React from "react";
import { NavLink } from "react-router-dom";

const MiniNavBar = () => {
  const ActiveLinkeHighLight = (isActive) => {
    return isActive ? "active-link" : "inactive-link";
  };
  return (
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
            to="/ethereal/contact"
            className={({ isActive }) => ActiveLinkeHighLight(isActive)}
          >
            Contact
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default MiniNavBar;
