import React from "react";
import ItemCard from "./ItemCard";
import { useContext } from "react";
import { DataContext } from "../context/DataContext";
import Spinners from "./Spinners";

const BestSaleListing = () => {
  const { data } = useContext(DataContext);
  if (!data) {
    return <Spinners />;
  }
  const fourItems = data.slice(0, 4);
  //   const [items, setItems] = useState([]);

  //   useEffect(() => {
  //     const fetchItems = async () => {
  //       try {
  //         const res = await fetch("/ethereal");
  //         if (!res.ok) {
  //           throw new Error("Network response was not ok");
  //         }
  //         const data = await res.json();
  //         setItems(data);
  //       } catch (error) {
  //         console.log("Fetch error: ", error);
  //       }
  //     };

  //     fetchItems();
  //   }, []);

  return (
    <section id="best_seller_section">
      <div id="best_seller">
        <h1 id="best_seller">Best Seller</h1>
      </div>
      <div id="itemsCard">
        {fourItems.map((item) => (
          <ItemCard key={item._id} item={item} />
        ))}
      </div>
    </section>
  );
};

export default BestSaleListing;
