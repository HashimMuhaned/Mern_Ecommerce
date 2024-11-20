import React from "react";
import { useNavigate } from "react-router-dom";

const CrazyDeals = () => {
  const navigate = useNavigate();
  return (
    <section
      id="sm-banner"
      className="section-p1"
      onClick={() => navigate("/ethereal/all")}
    >
      <div className="banner-box">
        <h4>crazy deals</h4>
        <h2>buy 1 get 1 free!</h2>
        <span>The best classic dress is on sale at cara</span>
        <button onClick={() => navigate("/ethereal/all")}>Learn More</button>
      </div>
      <div className="banner-box banner-box2">
        <h4>Spring/Summer</h4>
        <h2>Upcomming Season</h2>
        <span>The best classic dress is on sale at cara</span>
        <button onClick={() => navigate("/ethereal/all")}>Collection</button>
      </div>
    </section>
  );
};

export default CrazyDeals;
