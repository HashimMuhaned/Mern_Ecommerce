import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import { CheckUserContext } from "../context/CheckUserToken";
import DeleteCartButton from "../components/DeleteCartButton";
import { CartContext } from "../context/CartContext";
import { DataContext } from "../context/DataContext";
import ItemCard from "../components/ItemCard";
import { NavLink, useNavigate } from "react-router-dom";
import Spinners from "../components/Spinners";
import emptyCartImage from "../assets/EmptyPagesImages/empty_cart34png.png";
import { toast } from "react-toastify";

const CartPage = () => {
  const { isLoggedin } = useContext(CheckUserContext);
  const { cartItems, setCartItems } = useContext(CartContext);
  const { data } = useContext(DataContext); // Get the data from DataContext
  const [loading, setLoading] = useState(true); // Loading state for fetching cart items
  const [updating, setUpdating] = useState(false); // To show if an item is being updated
  const navigate = useNavigate();
  const [randomItems, setRandomItems] = useState([]);
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    // Shuffle and pick 4 random items
    const getRandomItems = (items, count) => {
      const shuffled = [...items].sort(() => 0.5 - Math.random());
      return shuffled?.slice(0, count);
    };

    // Assuming NewArrivalsCart is your original array of items
    const selectedItems = getRandomItems(data, 4);
    setRandomItems(selectedItems);
  }, [data]);

  // const NewArrivalsCart = data.slice(0, 3);

  // Fetch cart items when the component mounts or refreshes
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_API}/cart`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCartItems(response?.data?.items);
        setLoading(false); // Data has been fetched
      } catch (error) {
        console.error("Error fetching cart items:", error);
        setLoading(false); // Stop loading even if there's an error
      }
    };

    fetchCartItems(); // Fetch the cart items from the backend
  }, [setCartItems]);

  const updateCartItemQuantity = async (productId, newQuantity) => {
    try {
      setUpdating(true); // Set loading state
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_API}/cart/itemQuantityUpdate`,
        { productId, quantity: newQuantity },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCartItems(response.data.items);
      setUpdating(false); // Remove loading state
    } catch (error) {
      console.error("Error updating cart item quantity:", error);
      setUpdating(false);
    }
  };

  const handleQuantityChange = (e, productId) => {
    const newQuantity = parseInt(e.target.value, 10);
    if (newQuantity > 0) {
      updateCartItemQuantity(productId, newQuantity);
    }
  };

  const updateCartItemSize = async (productId, selectedSize) => {
    try {
      setUpdating(true); // Set loading state
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_API}/cart/itemSizeUpdate`, // Ensure the correct URL is used
        { productId, sizeChosen: selectedSize },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update the cart items with the latest response
      setCartItems(response.data.items);
      setUpdating(false); // Remove loading state
    } catch (error) {
      console.error("Error updating the selected size:", error);
      setUpdating(false); // Remove loading state even if there's an error
    }
  };

  const handleSizeChange = (e, productId) => {
    const selectedSize = e.target.value;

    // Log the selected size for debugging
    console.log("Selected size:", selectedSize);

    // Call the function to update the size on the backend
    if (selectedSize) {
      updateCartItemSize(productId, selectedSize);
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

  if (loading) {
    return <Spinners />;
  }

  return (
    <div>
      <div id="cartPage">
        {cartItems.length === 0 ? (
          <h2 id="cartTitle">Your Cart Items Will appear here</h2>
        ) : (
          <h2 id="cartTitle">Your Ethereal Cart</h2>
        )}
        <div id="cart-page">
          <section id="cart-container">
            {cartItems ? (
              cartItems?.length > 0 ? (
                <ul id="cartList">
                  {cartItems?.map((item, index) => {
                    const matchedProduct = data.find(
                      (product) => product._id === item.productId._id
                    );

                    return (
                      <li
                        key={`${item.productId?._id}-${index}`}
                        id="cartListContent"
                      >
                        <div id="cartItemDetails">
                          <img
                            style={{
                              width: "200px",
                              height: "200px",
                              objectFit: "cover",
                            }}
                            id="productImageCart"
                            src={item.productId.image1.url}
                            alt={item.productId.name}
                          />
                          <div id="cartItemOptions">
                            <NavLink
                              style={{ paddingTop: "10px", width: "100%" }}
                              id="cartItemName"
                              to={`/ethereal/categories/${item.productId.category}/${item.productId._id}`}
                            >
                              {item.productId.name}
                            </NavLink>
                            <div id="cartItemActions">
                              <select
                                style={{ width: "90px" }}
                                value={item.quantity}
                                onChange={(e) =>
                                  handleQuantityChange(e, item.productId._id)
                                }
                                disabled={updating}
                              >
                                {[...Array(10).keys()].map((i) => (
                                  <option key={i + 1} value={i + 1}>
                                    {i + 1}
                                  </option>
                                ))}
                              </select>
                              <select
                                style={{ width: "150px" }}
                                value={item.sizeChosen || ""} // Ensure the sizeChosen is reflected
                                onChange={(e) =>
                                  handleSizeChange(e, item.productId._id)
                                }
                                // Disabled only during actual update
                                disabled={false} // Temporarily disable the `updating` condition for testing
                              >
                                <option value="">Select Size</option>
                                {matchedProduct?.size?.length > 0 ? (
                                  matchedProduct.size.map((size, index) => (
                                    <option key={index} value={size}>
                                      {size}
                                    </option>
                                  ))
                                ) : (
                                  <option>No Sizes Available</option>
                                )}
                              </select>
                              <DeleteCartButton
                                productId={item.productId._id}
                                cartItems={cartItems}
                                setCartItems={setCartItems}
                              />
                            </div>
                          </div>
                        </div>
                        <div
                          style={{
                            width: "50%",
                            display: "flex",
                            justifyContent: "end",
                          }}
                        >
                          <p>Price: ${item.productId.price}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "70vh",
                    marginTop: "50px",
                  }}
                >
                  <img
                    id="emptyCartImage"
                    src={emptyCartImage}
                    alt="Empty Cart"
                    height={"300px"}
                    width={"400"}
                  />
                </div>
              )
            ) : null}
          </section>
          <section style={{ width: "500px", padding: "20px" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                border: "2px solid grey",
                height: "100px",
                borderRadius: "14px",
                padding: "20px 20px 0px 20px",
                gap: "10px",
                marginBottom: "10px",
              }}
            >
              Subtotal (
              {cartItems
                ? cartItems.length === 1
                  ? `${cartItems.length} item`
                  : `${cartItems.length} items`
                : null}
              ): $
              {cartItems
                ? cartItems
                    .reduce(
                      (acc, item) => acc + item.productId.price * item.quantity,
                      0
                    )
                    .toFixed(2)
                : null}
              <button
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "200px",
                  backgroundColor: "yellow",
                  border: "none",
                  borderRadius: "14px",
                  height: "30px",
                  cursor: "pointer",
                }}
                onClick={() =>
                  cartItems.length === 0
                    ? toast.error("Your cart is empty")
                    : navigate("/ethereal/cart/checkout")
                }
              >
                Proceed to checkout
              </button>
            </div>
            <div
              id="NewCartArrivals"
              style={{
                display: "flex",
                flexDirection: "column",
                border: "2px solid grey",
                padding: "10px",
                borderRadius: "14px",
              }}
            >
              <h2 style={{ display: "flex", justifyContent: "center" }}>
                People Also Buy
              </h2>
              {randomItems.map((item, index) => (
                <ItemCard key={index} item={item} />
              ))}
            </div>
          </section>
        </div>
      </div>
      {/* Mobile cart page */}
      <div id="MobileCartPage">
        {cartItems.length === 0 ? (
          <h2 id="cartTitle-mobile">Your Cart Items Will Appear Here</h2>
        ) : (
          <h2 id="cartTitle-mobile">Your Ethereal Cart</h2>
        )}
        <div id="cartPage-mobile">
          <section id="subtotalSection-mobile">
            Subtotal (
            {cartItems
              ? cartItems.length === 1
                ? `${cartItems.length} item`
                : `${cartItems.length} items`
              : null}
            ): $
            {cartItems
              ? cartItems
                  .reduce(
                    (acc, item) => acc + item.productId.price * item.quantity,
                    0
                  )
                  .toFixed(2)
              : null}
            <button
              id="checkoutButton-mobile"
              onClick={() =>
                cartItems.length === 0
                  ? toast.error("Your cart is empty")
                  : navigate("/ethereal/cart/checkout")
              }
            >
              Proceed to Checkout
            </button>
          </section>

          <section id="cartItemsSection-mobile">
            {cartItems && cartItems.length > 0 ? (
              <ul id="cartList-mobile">
                {cartItems.map((item, index) => {
                  const matchedProduct = data.find(
                    (product) => product._id === item.productId._id
                  );

                  return (
                    <li
                      key={`${item.productId?._id}-${index}`}
                      className="cartItem-mobile"
                    >
                      <div className="cartItemDetails-mobile">
                        <img
                          className="productImage-mobile"
                          src={item.productId.image1}
                          alt={item.productId.name}
                          width="100"
                        />
                        <div className="cartItemInfo-mobile">
                          <NavLink
                            className="cartItemName-mobile"
                            to={`/ethereal/categories/${item.productId.category}/${item.productId._id}`}
                          >
                            {item.productId.name}
                          </NavLink>
                          <p className="itemPrice-mobile">
                            Price: ${item.productId.price}
                          </p>
                          <div className="cartItemOptions-mobile">
                            <div>
                              Quantity: &nbsp;
                              <select
                                style={{
                                  width: "60px",
                                  height: "30px",
                                  border: "1px solid, #d1d1d1",
                                  borderRadius: "5px",
                                }}
                                value={item.quantity}
                                onChange={(e) =>
                                  handleQuantityChange(e, item.productId._id)
                                }
                                disabled={updating}
                              >
                                {[...Array(10).keys()].map((i) => (
                                  <option key={i + 1} value={i + 1}>
                                    {i + 1}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              Size: &nbsp;
                              <select
                                style={{
                                  width: "100px",
                                  height: "30px",
                                  border: "1px solid, #d1d1d1",
                                  borderRadius: "5px",
                                }}
                                value={item.sizeChosen || ""}
                                onChange={(e) =>
                                  handleSizeChange(e, item.productId._id)
                                }
                                disabled={false}
                              >
                                <option value="">Select Size</option>
                                {matchedProduct?.size?.length > 0 ? (
                                  matchedProduct.size.map((size, index) => (
                                    <option key={index} value={size}>
                                      {size}
                                    </option>
                                  ))
                                ) : (
                                  <option>No Sizes Available</option>
                                )}
                              </select>
                            </div>
                            <DeleteCartButton
                              productId={item.productId._id}
                              cartItems={cartItems}
                              setCartItems={setCartItems}
                            />
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div id="emptyCartImage-mobile">
                <p
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1rem",
                  }}
                >
                  Your cart is empty. <br />
                  Add items to your cart to see them here.
                </p>
              </div>
            )}
          </section>

          <section>
            <h2 className="recommendationsTitle-mobile">People Also Buy</h2>
            <div id="recommendationsSection-mobile">
              {randomItems.map((item, index) => (
                <ItemCard key={index} item={item} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
