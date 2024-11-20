import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../itemAnalysisDashboard.css";
import ItemViewsChart from "../components/ItemViewsChart";
import ItemFavoritesChart from "../components/ItemFavoritesChart";
import ItemCartChart from "../components/ItemCartChart";
import TotalItemSalesChart from "../components/TotalItemSalesChart";

const ItemAnalysisDashboardPage = () => {
  const { id } = useParams();

  // Step 1: Initialize filterDate from localStorage or default to "Day"
  const [filterDate, setFilterDate] = useState(() => {
    return localStorage.getItem("filterDate") || "Day";
  });

  useEffect(() => {
    // Step 2: Store filterDate in localStorage whenever it changes
    localStorage.setItem("filterDate", filterDate);
  }, [filterDate]);

  return (
    <section id="dashboard" style={{ paddingBottom: "20px" }}>
      <div id="FilterSection">
        <label htmlFor="filterDate" style={{ fontSize: "17px" }}>
          Filter by:
        </label>
        <select
          name="filterDate"
          id="filterDate"
          style={{
            width: "150px",
          }}
          value={filterDate} // Step 3: Bind the select value to filterDate state
          onChange={(e) => setFilterDate(e.target.value)}
        >
          <option value="Day">Last Day</option>
          <option value="Week">Last Week</option>
          <option value="Month">Last Month</option>
          <option value="Year">Last Year</option>
        </select>
      </div>
      <div id="favorites_cart_dashboard">
        <div id="numOfFavorite">
          <ItemFavoritesChart itemId={id} filterDate={filterDate} />
        </div>
        <div id="numOfCartItem">
          <ItemCartChart itemId={id} filterDate={filterDate} />
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "30px",
        }}
      >
        <div id="totalViewsOfThisItem">
          <ItemViewsChart itemId={id} filterDate={filterDate} />
        </div>
        <div id="totalSalesOfThisItem">
          <TotalItemSalesChart itemId={id} filterDate={filterDate} />
        </div>
      </div>
    </section>
  );
};

export default ItemAnalysisDashboardPage;
