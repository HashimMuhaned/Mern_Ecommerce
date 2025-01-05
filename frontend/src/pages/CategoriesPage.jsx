import React, { Fragment } from "react";
import Men from "../assets/Categories/Men.jpg";
import Women from "../assets/Categories/Women.jpg";
import hijabWomen from "../assets/Categories/hijabWomen.webp";
import Kids from "../assets/Categories/Kids.jpg";
import Home from "../assets/Categories/Home.jpg";
import Accessories from "../assets/Categories/Accessories.jpg";
import Beauty from "../assets/Categories/Beauty.jpg";
import { NavLink } from "react-router-dom";

const CategoriesPage = () => {
  return (
    <div id="categories">
      <NavLink
        id="man-category"
        className="category"
        to="/ethereal/categories/men"
      >
        <img src={Men} alt="men Picture" />
        <p>Men</p>
      </NavLink>
      <NavLink
        id="Women-category"
        className="category"
        to="/ethereal/categories/women"
      >
        <img src={hijabWomen} alt="men Picture" />
        <p>Women</p>
      </NavLink>
      <NavLink
        id="Kids-category"
        className="category"
        to="/ethereal/categories/kids"
      >
        <img src={Kids} alt="men Picture" />
        <p>Kids</p>
      </NavLink>
      <NavLink
        id="Home-category"
        className="category"
        to="/ethereal/categories/home"
      >
        <img src={Home} alt="men Picture" />
        <p>Home Essentials</p>
      </NavLink>
      <NavLink
        id="Accessories-category"
        className="category"
        to="/ethereal/categories/accessories"
      >
        <img src={Accessories} alt="men Picture" />
        <p>Accessories</p>
      </NavLink>
      <NavLink
        id="Beauty-category"
        className="category"
        to="/ethereal/categories/beauty"
      >
        <img src={Beauty} alt="men Picture" />
        <p>Beauty</p>
      </NavLink>
    </div>
  );
};

export default CategoriesPage;
