import React from "react";
import heroImage from "../assets/HeroMainImg.jpg";
import theWoman from "../assets/sheisgotthelook.jpg";
import DiscoverOffersLink from "./DiscoverOffersLink";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();
  return (
    <div id="hero">
      <div id="heroHook">
        <img src={theWoman} height={400} id="heroHook_img" />
        <div className="text-content" id="text-content">
          <h1 className="title">
            Summer Collection <span className="highlight">2024</span>
          </h1>
          <p className="description">
            Discover our latest arrivals and elevate your style with our
            exclusive summer collection. Embrace the season with vibrant colors
            and comfortable designs.
          </p>
          {/* <div className="buttons">
            <button
              className="shop-now-button"
              onClick={() => navigate("/ethereal/all")}
            >
              Shop Now
            </button>
            <DiscoverOffersLink />
          </div> */}
        </div>
      </div>
      <img src={heroImage} id="Hero_img" className="Hero_img" alt="Hero" />
      <div id="Hero_buttons">
        <button
          className="shop-now-button"
          onClick={() => navigate("/ethereal/all")}
        >
          Shop Now
        </button>
        <DiscoverOffersLink />
      </div>
    </div>
  );
};

export default Hero;
