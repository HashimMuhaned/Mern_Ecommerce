import React from "react";

const NewsLetter = () => {
  return (
    <section id="newsletter" class="section-p1 section-m1 section-newsletter">
      <div className="newstext">
        <h4>Sign Up For Daily Offers</h4>
        <p>
          Get E-mail updates about our latest shop and
          <span>special offers.</span>
        </p>
      </div>
      <div className="form">
        <input type="text" placeholder="Enter your E-mail addres" />
        <button>Sign-Up</button>
      </div>
    </section>
  );
};

export default NewsLetter;
