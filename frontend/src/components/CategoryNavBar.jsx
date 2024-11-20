import React from "react";
import { NavLink } from "react-router-dom";

const CategoryNavBar = () => {
  const ActiveLinkeHighLight = (isActive) => {
    return isActive ? "active-link" : "inactive-link";
  };
  return (
    <div>
      <ul id="categoryNavbar">
        <li>
          <NavLink
            to="/ethereal/categories/men"
            className={({ isActive }) => ActiveLinkeHighLight(isActive)}
            end
          >
            Men
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/ethereal/categories/women"
            className={({ isActive }) => ActiveLinkeHighLight(isActive)}
          >
            Women
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/ethereal/categories/kids"
            className={({ isActive }) => ActiveLinkeHighLight(isActive)}
          >
            kids
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/ethereal/categories/home"
            className={({ isActive }) => ActiveLinkeHighLight(isActive)}
          >
            Home Essentials
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/ethereal/categories/accessories"
            className={({ isActive }) => ActiveLinkeHighLight(isActive)}
          >
            Accssories
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/ethereal/categories/beauty"
            className={({ isActive }) => ActiveLinkeHighLight(isActive)}
          >
            Beauty
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default CategoryNavBar;
