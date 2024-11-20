import React from "react";
import notFound from "../assets/notFound.png";

const NotFoundPage = () => {
  return (
    <div className="NotFoundContainer">
      <img src={notFound} alt="Not Found" id="notFound_img"/>
    </div>
  );
};

export default NotFoundPage;
