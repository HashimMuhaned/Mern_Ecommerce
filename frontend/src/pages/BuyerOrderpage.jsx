import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { NavLink } from "react-router-dom";
import { CheckUserContext } from "../context/CheckUserToken"; // Context now provides buyer info
import Spinners from "../components/Spinners";
import "../OrdersPagesStyling.css";

const BuyerOrderpage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const { userInfo, isLoggedin } = useContext(CheckUserContext); // Assuming the context provides the logged-in user's (buyer's) ID
  const buyerId = userInfo._id;
  const token = localStorage.getItem("authToken");

  // Fetch the orders for the logged-in buyer
  useEffect(() => {
    if (buyerId) {
      fetchBuyerOrders(buyerId);
    }
  }, [buyerId]);

  const fetchBuyerOrders = async (buyerId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_API}/ordersBuyer?buyerId=${buyerId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOrders(response.data.orders);
    } catch (error) {
      console.error("Error fetching buyer's orders:", error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  if (!isLoggedin) {
    return (
      <p id="login_to_view">
        Please{" "}
        <NavLink
          to={"/ethereal/login"}
          style={{ color: "blue", textDecoration: "underline" }}
        >
          Login to view your orders.
        </NavLink>
      </p>
    );
  }

  return (
    <section className="orders-container">
      {loading ? (
        <Spinners />
      ) : orders.length === 0 ? (
        <p
          style={{
            display: "flex",
            height: "70vh",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          No orders found.
        </p>
      ) : (
        <ul className="orders-list">
          {orders.map((order) => (
            <li key={order._id} className="each-order">
              <h3>Order ID: {order._id}</h3>
              <p>Total Price: ${order.totalPrice.toFixed(2)}</p>
              <p>
                Address: {order.userLocation.address}, {order.userLocation.city}
              </p>
              <br />
              <ul className="inner-order-list" style={{ listStyle: "none" }}>
                {order.items.map((item) => (
                  <li key={item.productId?._id || item._id}>
                    {item.productId ? (
                      <>
                        {item.productId.name.length > 60
                          ? item.productId.name.slice(0, 59)
                          : item.productId.name}
                        {"  "}
                        (Quantity: {item.quantity}) - $
                        {(item.price * item.quantity).toFixed(2)}
                        {" | "}
                        Delivery state: {item.status || "Pending"}
                      </>
                    ) : (
                      <p>Product details are not available</p>
                    )}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default BuyerOrderpage;
