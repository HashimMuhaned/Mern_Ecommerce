import React from "react";
import { useContext, useState } from "react";
import { DataContext } from "../context/DataContext";
import ItemCard from "../components/ItemCard";
import Spinners from "../components/Spinners";
import { useSearchParams } from "react-router-dom"; // Hook to get URL search parameters

const AllItems = () => {
  const { data } = useContext(DataContext);

  const [priceFilter, setPriceFilter] = useState(""); // "asc" for ascending, "desc" for descending
  const [categoryFilter, setCategoryFilter] = useState("");
  const [subCategoryFilter, setSubCategoryFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState(""); // Could represent "gender"

  const [searchParams] = useSearchParams(); // Get the search parameters from the URL
  const searchQuery = searchParams.get("search") || ""; // Extract the 'search' query parameter

  if (!data) {
    return <Spinners />;
  }

  // Combine all filtering logic into one filteredData array
  const filteredData = data
    .filter((item) => {
      // Apply search query filtering
      if (
        searchQuery &&
        !item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;

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
    <div id="all_items_page">
      <section id="all_items_page_filter_box">
        {/* Filter Box */}
        <div
          id="filter_box"
          style={{ marginBottom: "20px", marginTop: "20px", border: "none" }}
        >
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
            Category:
            <select
              name="category"
              value={categoryFilter}
              onChange={handleFilterChange}
            >
              <option value="">All</option>
              <option value="kids">Kids</option>
              <option value="home">Home Essentials</option>
              <option value="accessories">Accessories</option>
              <option value="beauty">Beauty</option>
              <option value="electronics">Electronics</option>
              {/* Add more categories based on your schema */}
            </select>
          </label>

          <label>
            Gender:
            <select
              name="gender"
              value={genderFilter}
              onChange={handleFilterChange}
            >
              <option value="">All</option>
              <option value="men">Men's</option>
              <option value="women">Women's</option>
              <option value="unisex">Unisex</option>
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
              {/* Adjust subcategories based on your data */}
            </select>
          </label>
        </div>
      </section>
      <section id="all_items_section">
        {/* Items Display */}
        <div id="itemsCard">
          {filteredData.length > 0 ? (
            filteredData.map((item) => <ItemCard key={item._id} item={item} />)
          ) : (
            <p>No items found matching "{searchQuery}"</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default AllItems;
