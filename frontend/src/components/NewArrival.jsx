import React from "react";
import { useContext } from "react";
import { DataContext } from "../context/DataContext";
import ItemCard from "./ItemCard";
import Spinners from "./Spinners";

const NewArrival = () => {
  const { data } = useContext(DataContext);
  if (!data) {
    return <Spinners />;
  }

  const newArrivalsItmes = data.slice(4, 11);

  return (
    <section id="best_seller_section">
      <div id="best_seller">
        <h1 id="best_seller">New Arrivals</h1>
      </div>
      <div id="itemsCard">
        {newArrivalsItmes.map((item) => (
          <ItemCard key={item._id} item={item} />
        ))}
      </div>
    </section>
  );
};

export default NewArrival;
