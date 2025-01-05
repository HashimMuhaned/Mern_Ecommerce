import React from "react";
import heroImage from "../assets/HeroMainImg.jpg";
import MenHeroSection from "../assets/MenHeroSection.avif";
import MenHeroSection2 from "../assets/MenHeroSection2.avif";
import MenHeroSection3 from "../assets/MenHeroSection3.jpg";
import theWoman from "../assets/sheisgotthelook.jpg";
import DiscoverOffersLink from "./DiscoverOffersLink";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();
  return (
    <div id="hero">
      <div id="heroHook">
        {/* <img src={theWoman} height={400} id="heroHook_img" /> */}
        <div id="heroHook_img">
          𝑻𝒖𝒓𝒏 𝒀𝒐𝒖𝒓 𝑷𝒂𝒔𝒔𝒊𝒐𝒏 𝑰𝒏𝒕𝒐 𝑷𝒓𝒐𝒇𝒊𝒕! 𝑪𝒓𝒆𝒂𝒕𝒆 𝒀𝒐𝒖𝒓 𝑶𝒘𝒏 𝑶𝒏𝒍𝒊𝒏𝒆 𝑺𝒕𝒐𝒓𝒆 𝒂𝒏𝒅 𝑺𝒕𝒂𝒓𝒕
          𝑺𝒆𝒍𝒍𝒊𝒏𝒈 𝑻𝒐𝒅𝒂𝒚. 𝒀𝒐𝒖𝒓 𝑩𝒖𝒔𝒊𝒏𝒆𝒔𝒔, 𝒀𝒐𝒖𝒓 𝑹𝒖𝒍𝒆𝒔 – 𝑾𝒆 𝑴𝒂𝒌𝒆 𝑰𝒕 𝑬𝒂𝒔𝒚 𝒕𝒐 𝑺𝒖𝒄𝒄𝒆𝒆𝒅!
        </div>
        <div className="text-content" id="text-content">
          <h1 className="title">
            Summer Collection <span className="highlight">2024</span>
          </h1>
          <p className="description">
            Turn Your Passion Into Profit! Create Your Own Online Store and
            Start Selling Today. Your Business, Your Rules – We Make It Easy to
            Succeed!
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
      <img
        src={MenHeroSection3}
        id="Hero_img"
        className="Hero_img"
        alt="Hero"
      />
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
