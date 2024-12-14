import React, { useContext } from "react";
import { CheckUserContext } from "../context/CheckUserToken";
import { YourItemsContext } from "../context/YourItemsContext";
import { NavLink } from "react-router-dom";
import ItemCard from "../components/ItemCard";
import Spinners from "../components/Spinners";

const YourItemsPage = () => {
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
          Login to view your Items.
        </NavLink>
      </p>
    );
  } else if (isLoggedin && !yourItems) {
    <Spinners />;
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

export default YourItemsPage;
