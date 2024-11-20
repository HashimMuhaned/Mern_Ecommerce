import React, { useState, useEffect, useContext } from "react";
import ItemCard from "../components/ItemCard";
import { useParams, NavLink, useNavigate, useLocation } from "react-router-dom";
import Spinners from "../components/Spinners";
import { DataContext } from "../context/DataContext";

const CategoryListingPage = () => {
  const { data } = useContext(DataContext);

  const [priceFilter, setPriceFilter] = useState(""); // "asc" for ascending, "desc" for descending
  const [categoryFilter, setCategoryFilter] = useState("");
  const [subCategoryFilter, setSubCategoryFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState(""); // Could represent "gender"
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    // Extract the category name from the path and update the selected category
    const pathSegments = location.pathname.split("/");
    const categoryFromPath = pathSegments[3]; // Assuming the category is the 4th segment in the URL

    switch (categoryFromPath) {
      case "men":
      case "women":
      case "kids":
      case "accessories":
      case "home-essentials":
      case "beauty":
        setSelectedCategory(categoryFromPath);
        break;
      default:
        setSelectedCategory("");
    }
  }, [location.pathname]);

  const handleCategoryChange = (event) => {
    const selectedCategory = event.target.value;
    selectedCategory
      ? navigate(`/ethereal/categories/${selectedCategory}`)
      : null;
      selectedCategory === "all" ? navigate(`/ethereal/all`) : null;
  };

  const ActiveLinkeHighLight = (isActive) => {
    return isActive ? "active-link" : "inactive-link";
  };

  const { category } = useParams(); // Get the category from URL params

  useEffect(() => {
    // Set the category filter based on the URL parameter when it changes
    setCategoryFilter(category);
  }, [category]);

  if (!data) {
    return <Spinners />;
  }

  const filteredData = data
    .filter((item) => {
      // Apply category filter
      if (categoryFilter && item.category !== categoryFilter) return false;

      // Apply gender filter (if gender is being treated as category, make sure it's accurate)
      if (genderFilter && item.category !== genderFilter) return false;

      // Apply sub-category filter
      if (subCategoryFilter && item.subCategory !== subCategoryFilter)
        return false;

      return true;
    })
    .sort((a, b) => {
      // Price sorting
      if (priceFilter === "asc") {
        return a.price - b.price; // Sort from lowest to highest
      } else if (priceFilter === "desc") {
        return b.price - a.price; // Sort from highest to lowest
      }
      return 0; // No sorting if filter is not applied
    });

  // Handle changes in filter selection
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === "price") setPriceFilter(value);
    if (name === "category") setCategoryFilter(value);
    if (name === "gender") setGenderFilter(value);
    if (name === "subCategory") setSubCategoryFilter(value);
  };

  return (
    <div>
      <section>
        <div>
          <ul id="mininavbar">
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
                Kids
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
                Accessories
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
      </section>
      <div id="all_items_page">
        <section id="filter_box_section">
          {/* Filter Box */}
          <div id="filter_box">
            <label>
              Sort by Price:
              <select
                name="price"
                value={priceFilter}
                onChange={handleFilterChange}
              >
                <option value="">None</option>
                <option value="asc">Lowest to Highest</option>
                <option value="desc">Highest to Lowest</option>
              </select>
            </label>

            <label>
              Sub Category:
              <select
                name="subCategory"
                value={subCategoryFilter}
                onChange={handleFilterChange}
              >
                <option value="">All</option>
                <option value="topW">Top Wear</option>
                <option value="bottomW">Bottom Wear</option>
              </select>
            </label>

            <label>
              Category:
              <select
                name="category"
                value={selectedCategory}
                onChange={handleCategoryChange}
              >
                {/* <option value="">All</option> */}
                <option value="all">All</option>
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="kids">Kids</option>
                <option value="home-essentials">Home Essentials</option>
                <option value="accessories">Accessories</option>
                <option value="beauty">Beauty</option>
              </select>
            </label>
          </div>
        </section>
        <section id="all_items_section">
          {/* Items Display */}
          <div id="itemsCard">
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <ItemCard key={item._id} item={item} />
              ))
            ) : (
              <p>No items found matching the filters.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default CategoryListingPage;
