import React, { useContext } from "react";
import { CheckUserContext } from "../context/CheckUserToken";
import { YourItemsContext } from "../context/YourItemsContext";
import ItemCard from "../components/ItemCard";
import { NavLink } from "react-router-dom";

const ItemsAnalysis = () => {
  const { isLoggedin } = useContext(CheckUserContext);
  const { yourItems } = useContext(YourItemsContext);

  if (!isLoggedin) {
    return (
      <p id="login_to_view">
        Please{" "}
        <NavLink
          to={"/ethereal/login"}
          style={{ color: "blue", textDecoration: "underline" }}
        >
          Please Login.
        </NavLink>
      </p>
    );
  }
  return (
    <div>
      {yourItems.length > 0 ? (
        <section id="best_seller_section">
          <div id="itemsCard">
            {yourItems.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>
        </section>
      ) : (
        <p
          style={{
            display: "flex",
            justifyContent: "center",
            height: "70vh",
            alignItems: "center",
          }}
        >
          You have no items.
        </p>
      )}
    </div>
  );
};

export default ItemsAnalysis;
