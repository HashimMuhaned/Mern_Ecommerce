import React from "react";
import { useNavigate } from "react-router-dom";

const SeasonalCollections = () => {
  const navigate = useNavigate();
  return (
    <section id="banner3" onClick={() => navigate("/ethereal/all")}>
      <div className="banner-box">
      </div>
      <div className="banner-box banner-box2">
        <h2>New Footware Collection</h2>
        <h3>Spring/Summer 2022</h3>
      </div>
      <div className="banner-box banner-box3">
        <h2>T-shirts</h2>
        <h3>New Trendy Prints</h3>
      </div>
    </section>
  );
};

export default SeasonalCollections;
