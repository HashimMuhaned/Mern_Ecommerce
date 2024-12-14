import React, { Fragment, useState, useContext } from "react";
import axios from "axios";
import ConfirmWindow from "../components/ConfirmWindow";
import { toast } from "react-toastify";
import { YourItemsContext } from "../context/YourItemsContext";
import { FavoriteContext } from "../context/FavoriteContext";
import { CartContext } from "../context/CartContext";

const DeleteYourItemButton = ({ productId }) => {
  const [showModal, setShowModal] = useState(false);
  const { yourItems, setYourItems } = useContext(YourItemsContext);
  const { setFavoriteItems } = useContext(FavoriteContext);
  const { setCartItems } = useContext(CartContext);

  const handleDelete = async () => {
    try {
      const response = await axios.delete(`${process.env.BACKEND_API}/yourItem/delete/${productId}`, {
        withCredentials: true,
      });

      if (response.status === 200) {
        // Remove the deleted item from the yourItems state
        setYourItems(yourItems.filter((item) => item._id !== productId));
        toast.success("Item Unpublished successfully");
      }
      setShowModal(false);

      // updating the favorite Items to reflect the changes
      const updatedFavoriteItems = await axios.get(`${process.env.BACKEND_API}/favorites/get`, {
        withCredentials: true,
      });
      setFavoriteItems(updatedFavoriteItems.data);

      const updatedCartItems = await axios.get(`${process.env.BACKEND_API}/cart`, {
        withCredentials: true,
      });
      setCartItems(updatedCartItems.data.items);
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };
  return (
    <Fragment>
      <button
        id="deleteItemButton"
        onClick={() => setShowModal(true)}
        style={{
          display: "flex",
          alignItems: "center",
          padding: "10px",
          width: "80px",
          height: "37px",
          border: "none",
          borderRadius: "6px",
          backgroundColor: "red",
          color: "white",
          cursor: "pointer",
        }}
      >
        Unpublish
      </button>
      <ConfirmWindow
        show={showModal}
        onConfirm={handleDelete}
        onCancel={() => setShowModal(false)}
        message={"Are you sure You want to Unpublish the item from your store"}
      />
    </Fragment>
  );
};

export default DeleteYourItemButton;
