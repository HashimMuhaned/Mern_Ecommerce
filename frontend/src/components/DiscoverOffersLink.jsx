import React from "react";

const DiscoverOffersLink = () => {
  const handleScrollToBanner = () => {
    const bannerElement = document.getElementById("sm-banner");
    bannerElement.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <button className="discover-offers-button" onClick={handleScrollToBanner}>
      Discover Offers
    </button>
  );
};

export default DiscoverOffersLink;
