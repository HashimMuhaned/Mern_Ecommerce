import React, { useContext, useState } from "react";
import axios from "axios";
import "../CheckoutDetailsPage.css";
import { CartContext } from "../context/CartContext"; // Import CartContext
import { CheckUserContext } from "../context/CheckUserToken";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const CheckoutDetailsFormPage = () => {
  const { cartItems, totalCartCost, clearCart } = useContext(CartContext); // Access cart items and clearCart
  const cartItemsNumber = cartItems.length;
  const { userInfo } = useContext(CheckUserContext);

  const navigate = useNavigate();
  const [address, setAddress] = useState({
    country: "United States",
    fullname: "",
    phone: "",
    address: "",
    address2: "",
    city: "",
    state: "",
    zipcode: "",
    defaultAddress: false,
  });

  // Handle change for form inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress({
      ...address,
      [name]: value,
    });
  };

  // Handle checkbox change for default address
  const handleCheckboxChange = (e) => {
    setAddress({
      ...address,
      defaultAddress: e.target.checked,
    });
  };

  // Submit form handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    const order = {
      buyer: userInfo._id, // Buyer is the logged-in user's ObjectId
      items: cartItems.map((item) => ({
        productId: item.productId._id, // product ID
        quantity: item.quantity,
        price: item.productId.price, // Individual price
        seller: item.productId.user, // Seller (user) from product
      })),
      totalPrice: cartItems.reduce(
        (acc, item) => acc + item.productId.price * item.quantity,
        0
      ),
      userLocation: address, // Shipping address
    };

    try {
      const response = await axios.post("/api/submitOrder", order, {
        withCredentials: true,
      });
      console.log("Order placed successfully:", response.data);
      toast.success("Order placed successfully!");

      // Clear the cart after the order is submitted successfully
      await clearCart();

      navigate("/ethereal/profile/BuyerOrderpage");
    } catch (error) {
      console.error("Error placing order:", error);
    }
  };

  return (
    <div
      id="checkout-details-form-page"
      style={{
        display: "flex",
        alignItems: "start",
        justifyContent: "center",
        gap: "20px",
      }}
    >
      <div className="checkout-container">
        <h2>Add a new address</h2>

        <button className="autofill-btn">
          Save time. Autofill your current location. <span>Autofill</span>
        </button>

        <form className="checkout-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="country" id="label">
              Country/Region
            </label>
            <select
              id="country select"
              name="country"
              value={address.country}
              onChange={handleChange}
            >
              <option value="United States">United States</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="fullname" id="label">
              Full name (First and Last name)
            </label>
            <input
              type="text"
              id="fullname input"
              name="fullname"
              value={address.fullname}
              onChange={handleChange}
              placeholder="Full name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone" id="label">
              Phone number
            </label>
            <input
              type="text"
              id="phone input"
              name="phone"
              value={address.phone}
              onChange={handleChange}
              placeholder="Phone number"
              required
            />
            <small>May be used to assist delivery</small>
          </div>

          <div className="form-group">
            <label htmlFor="address" id="label">
              Address
            </label>
            <input
              type="text"
              id="address input"
              name="address"
              value={address.address}
              onChange={handleChange}
              placeholder="Street address or P.O. Box"
              required
            />
            <input
              type="text"
              id="address2 input"
              name="address2"
              value={address.address2}
              onChange={handleChange}
              placeholder="Apt, suite, unit, building, floor, etc."
            />
          </div>

          <div className="form-group-inline">
            <div className="form-group">
              <label htmlFor="city" id="label">
                City
              </label>
              <input
                type="text"
                id="city input"
                name="city"
                value={address.city}
                onChange={handleChange}
                placeholder="City"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="state" id="label">
                State
              </label>
              <select
                id="state select"
                name="state"
                value={address.state}
                onChange={handleChange}
                required
              >
                <option value="" disabled>
                  Select
                </option>
                <option value="NY">New York</option>
                <option value="CA">California</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="zipcode" id="label">
                ZIP Code
              </label>
              <input
                type="text"
                id="zipcode input"
                name="zipcode"
                value={address.zipcode}
                onChange={handleChange}
                placeholder="ZIP Code"
                required
              />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignContent: "center",
              alignItems: "start",
              gap: "10px",
            }}
          >
            <input
              type="checkbox"
              name="defaultAddress"
              checked={address.defaultAddress}
              onChange={handleCheckboxChange}
            />
            <label name="defaultAddress" id="label">
              Make this my default address
            </label>
          </div>

          <button type="submit" className="Place-Order-Btn">
            Place Order
          </button>
        </form>
      </div>

      <div className="order-summary">
        <h2>Order Summary</h2>
        <div>
          <p>Total Items: ({cartItemsNumber}) Items</p>
          <p>Shipping & handling: --</p>
          <p>Total before tax: --</p>
          <p>Estimated tax to be collected: --</p>
          <p>Total Price: ${totalCartCost}</p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutDetailsFormPage;
