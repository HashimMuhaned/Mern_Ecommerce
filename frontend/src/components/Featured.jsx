import React from "react";
import f1 from "../assets/Features/f1.png";
import f2 from "../assets/Features/f2.png";
import f3 from "../assets/Features/f3.png";
import f4 from "../assets/Features/f4.png";
import f5 from "../assets/Features/f5.png";
import f6 from "../assets/Features/f6.png";

const Featured = () => {
  return (
    <section id="feature" className="section-p1">
      <div className="fe-box">
        <img src={f1} />
        <h6>Free Shipping</h6>
      </div>
      <div className="fe-box">
        <img src={f2} alt="" />
        <h6>Online Order</h6>
      </div>
      <div className="fe-box">
        <img src={f3} alt="" />
        <h6>Save Money</h6>
      </div>
      <div className="fe-box">
        <img src={f4} alt="" />
        <h6>Promotion</h6>
      </div>
      <div className="fe-box">
        <img src={f5} alt="" />
        <h6>Happy Sell</h6>
      </div>
      <div className="fe-box">
        <img src={f6} alt="" />
        <h6>24/7 Support</h6>
      </div>
    </section>
  );
};

export default Featured;
