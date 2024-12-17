import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { CheckUserContext } from "../context/CheckUserToken";
import "../OrdersPagesStyling.css";
import { NavLink } from "react-router-dom";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const { userInfo, isLoggedin } = useContext(CheckUserContext);
  const sellerId = userInfo._id;
  const token = localStorage.getItem("authToken");

  // Fetch the orders for the logged-in seller
  useEffect(() => {
    if (sellerId) {
      fetchSellerOrders(sellerId);
    }
  }, [sellerId]);

  const fetchSellerOrders = async (sellerId) => {
    try {
      const response = await axios.get(`${process.env.BACKEND_API}/orders?sellerId=${sellerId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOrders(response.data.orders);
    } catch (error) {
      console.error("Error fetching seller's orders:", error);
    }
  };

  const handleStatusChange = async (orderId, productId, newStatus) => {
    try {
      // Call your API to update the item's status
      await axios.patch(
        `${process.env.BACKEND_API}/orders/${orderId}/items/${productId}/updateStatus`,
        {
          status: newStatus,
        }
      );

      // Update the local orders state to reflect the change
      setOrders((prevOrders) =>
        prevOrders.map((order) => {
          if (order._id === orderId) {
            return {
              ...order,
              items: order.items.map((item) =>
                item.productId._id === productId
                  ? { ...item, status: newStatus }
                  : item
              ),
            };
          }
          return order;
        })
      );
    } catch (error) {
      console.error("Error updating item status:", error);
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
          Login to view your cart.
        </NavLink>
      </p>
    );
  }

  return (
    <section className="orders-container">
      {orders.length === 0 ? (
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
              <p>Buyer: {order.buyer}</p>
              <p>Total Price: ${order.totalPrice.toFixed(2)}</p>
              <p>
                Address: {order.userLocation.address}, {order.userLocation.city}
              </p>
              <br />
              <ul className="inner-order-list" style={{ listStyle: "none" }}>
                {order.items.map((item) => (
                  <li key={item.productId._id}>
                    {item.productId.name.length > 60
                      ? item.productId.name.slice(0, 59)
                      : item.productId.name}{" "}
                    (Quantity: {item.quantity}) - $
                    {item.price.toFixed(2) * item.quantity}
                    <br />
                    <select
                      value={item.status}
                      onChange={(e) =>
                        handleStatusChange(
                          order._id,
                          item.productId._id,
                          e.target.value
                        )
                      }
                      style={{ marginTop: "10px", width: "200px" }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Out for Shipping">Out for Shipping</option>
                      <option value="Handed">Handed</option>
                    </select>
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

export default OrdersPage;
