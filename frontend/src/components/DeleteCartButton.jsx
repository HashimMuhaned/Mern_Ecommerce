import React, { Fragment, useState } from "react";
import axios from "axios";
// import { CheckUserContext } from "../context/CheckUserToken";
import ConfirmWindow from "../components/ConfirmWindow";
// import { CartContext } from "../context/CartContext";

const DeleteCartButton = ({ productId, cartItems, setCartItems }) => {
  //   const { isLoggedin } = useContext(CheckUserContext);
  // const { cartItems, setCartItems } = useContext(CartContext);

  const token = localStorage.getItem("authToken");
  const [showModal, setShowModal] = useState(false);
  const handleDelete = async () => {
    try {
      const response = await axios.delete(
        `${process.env.BACKEND_API}/cart/delete/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        // Remove the deleted item from the cartItems state
        setCartItems(
          cartItems.filter((item) => item.productId._id !== productId)
        );
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };
  return (
    <Fragment>
      <button
        onClick={() => setShowModal(true)}
        style={{
          padding: "10px",
          width: "90px",
          border: "none",
          borderRadius: "4px",
          backgroundColor: "red",
          color: "white",
          cursor: "pointer",
        }}
      >
        Delete Item
      </button>
      <ConfirmWindow
        show={showModal}
        onConfirm={handleDelete}
        onCancel={() => setShowModal(false)}
        message={"Are you sure You want to remove the item from the cart"}
      />
    </Fragment>
  );
};

export default DeleteCartButton;
