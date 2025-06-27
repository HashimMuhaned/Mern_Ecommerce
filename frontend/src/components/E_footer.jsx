import React from "react";
import { NavLink } from "react-router-dom";
import payApp from "../assets/Pay/app.jpg";
import payPlay from "../assets/Pay/play.jpg";
import payPay from "../assets/Pay/pay.png";
import { FaFacebook } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa6";
import { FaYoutube } from "react-icons/fa";

const E_footer = () => {
  return (
    <footer style={{ marginTop: "50px" }}>
      <div className="col">
        <h1 id="footerLogo">Ethereal.</h1>
        <h4>Contact</h4>
        <p>
          <strong>Address:</strong> Ajman, Nuaimyah
        </p>
        <p>
          <strong>Phone:</strong>+971509457257
        </p>
        <p></p>
        <h4>Follow Us</h4>
        <div className="follow">
          <div className="icon">
            <NavLink to="" target="_blank">
              <FaFacebook id="socials" />
            </NavLink>
            <NavLink to="" target="_blank">
              <FaInstagram id="socials" />
            </NavLink>
            <NavLink to="" target="_blank">
              <FaYoutube id="socials" />
            </NavLink>
          </div>
        </div>
      </div>

      <div className="col">
        <h4>About</h4>
        <NavLink to="#">About Us</NavLink>
        <NavLink to="#">Delivery Information</NavLink>
        <NavLink to="#">Privacy Policy</NavLink>
        <NavLink to="#">Terms & Conditions</NavLink>
        <NavLink to="/ethereal/contact">Contact Us</NavLink>
      </div>

      <div className="col">
        <h4>My Acount</h4>
        <NavLink to="/ethereal/login">Sign in</NavLink>
        <NavLink to="/ethereal/cart">View Cart</NavLink>
        <NavLink to="/ethereal/favorites">My Wishlist</NavLink>
        <NavLink to="#">Track My Order</NavLink>
        <NavLink to="/ethereal/contact">Help</NavLink>
      </div>

      <div className="col install">
        <h4>Install Our App</h4>
        <p>From Google Play or App Store</p>
        <div className="row">
          <img src={payApp} alt="" />
          <img src={payPlay} alt="" />
        </div>
        <p>Secured Payment Getaway</p>
        <img src={payPay} alt="" />
      </div>

      <div className="copyright">
        <p>&copy;Hashim Gurashi Internship Project</p>
      </div>
    </footer>
  );
};

export default E_footer;
