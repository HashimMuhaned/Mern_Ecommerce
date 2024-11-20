import React from "react";
import { Fragment } from "react";
import Hero from "../components/Hero";
import BestSaleListing from "../components/BestSaleListing";
import Featured from "../components/Featured";
import Off_70 from "../components/Off_70";
import NewArrival from "../components/NewArrival";
import CrazyDeals from "../components/CrazyDeals";
import SeasonalCollections from "../components/SeasonalCollections";
import NewsLetter from "../components/NewsLetter";
import E_footer from "../components/E_footer";

const HomePage = () => {
  return (
    <Fragment>
      <Hero />
      <Featured />
      <BestSaleListing />
      <Off_70 />
      <NewArrival />
      <CrazyDeals />
      <SeasonalCollections />
      <NewsLetter />
      <E_footer />
    </Fragment>
  );
};

export default HomePage;
