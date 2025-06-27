import React, { useState, useEffect, useContext, Fragment } from "react";
import { useParams } from "react-router-dom";
import { DataContext } from "../context/DataContext";
import ItemCard from "../components/ItemCard";
import AddToCartButton from "../components/AddToCartButton";

const ProductDisplay = () => {
  const { category, id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const { data } = useContext(DataContext);
  const [product, setProduct] = useState({});
  const [mainImage, setMainImage] = useState(""); // For the currently displayed image
  const [initialImage, setInitialImage] = useState(""); // Store the original main image (image1)
  const [randomItems, setRandomItems] = useState([]);


  useEffect(() => {
    // Shuffle and pick 4 random items
    const getRandomItems = (items, count) => {
      const shuffled = [...items].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    };

    // Assuming NewArrivalsCart is your original array of items
    const selectedItems = getRandomItems(data, 4);
    setRandomItems(selectedItems);
  }, [data]);

  // Fetch product data when the component mounts or when category/id changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `${process.env.BACKEND_API}/categories/${category}/${id}`
        );
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setProduct(data);
        setMainImage(data.image1.url); // Set the main image when new product data is fetched
        setInitialImage(data.image1.url); // Store the original main image (image1)
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [category, id]); // Only re-run when category or id changes

  // Handle image click to change the main image
  const handleImageClick = (imageSrc) => {
    setMainImage(imageSrc); // Update the main image when a small image is clicked
  };

  // Handle resetting the main image to the original image (image1)
  const resetMainImage = () => {
    setMainImage(initialImage); // Reset the main image to the original main image
  };

  return (
    <Fragment>
      <section id="prodetails" className="section-p1">
        <div className="single-pro-img">
          {/* Left side - Small images */}
          <div className="small-img-group">
            <div className="small-img-col">
              <img
                src={initialImage} // Set the main image back to the original image1
                className="small-img"
                onClick={resetMainImage}
                alt="Small Product"
              />
            </div>
            {product.image2.url && (
              <div className="small-img-col">
                <img
                  src={product.image2.url}
                  className="small-img"
                  onClick={() => handleImageClick(product.image2.url)}
                  alt="Small Product"
                />
              </div>
            )}
            {product.image3.url && (
              <div className="small-img-col">
                <img
                  src={product.image3.url}
                  className="small-img"
                  onClick={() => handleImageClick(product.image3.url)}
                  alt="Small Product"
                />
              </div>
            )}
            {product.image4.url && (
              <div className="small-img-col">
                <img
                  src={product.image4.url}
                  className="small-img"
                  onClick={() => handleImageClick(product.image4.url)}
                  alt="Small Product"
                />
              </div>
            )}
            {product.image5.url && (
              <div className="small-img-col">
                <img
                  src={product.image5.url}
                  className="small-img"
                  onClick={() => handleImageClick(product.image5.url)}
                  alt="Small Product"
                />
              </div>
            )}
          </div>

          {/* Right side - Main image */}
          <div className="main-img">
            <img src={mainImage} width="100%" id="MainImg" alt="Main Product" />
          </div>
        </div>

        <div className="single-pro-img-mobile">
          {/* Main image */}
          <div className="main-img-mobile">
            <img
              src={mainImage}
              width="100%"
              id="MainImgMobile"
              alt="Main Product"
            />
          </div>

          {/* Small images below the main image */}
          <div className="small-img-group-mobile">
            <div className="small-img-col-mobile">
              <img
                src={initialImage}
                className="small-img-mobile"
                onClick={resetMainImage}
                alt="Small Product"
              />
            </div>
            {product.image2 && (
              <div className="small-img-col-mobile">
                <img
                  src={product.image2.url}
                  className="small-img-mobile"
                  onClick={() => handleImageClick(product.image2.url)}
                  alt="Small Product"
                />
              </div>
            )}
            {product.image3 && (
              <div className="small-img-col-mobile">
                <img
                  src={product.image3.url}
                  className="small-img-mobile"
                  onClick={() => handleImageClick(product.image3.url)}
                  alt="Small Product"
                />
              </div>
            )}
            {product.image4 && (
              <div className="small-img-col-mobile">
                <img
                  src={product.image4.url}
                  className="small-img-mobile"
                  onClick={() => handleImageClick(product.image4.url)}
                  alt="Small Product"
                />
              </div>
            )}
            {product.image5 && (
              <div className="small-img-col-mobile">
                <img
                  src={product.image5.url}
                  className="small-img-mobile"
                  onClick={() => handleImageClick(product.image5.url)}
                  alt="Small Product"
                />
              </div>
            )}
          </div>
        </div>

        <div className="single-pro-details">
          <h4>{product.name}</h4>
          <h2>${product.price}</h2>
          <select
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
          >
            <option value="">Select Size</option>
            {product.size && product.size.length > 0 ? (
              product.size.map((size, index) => (
                <option key={index} value={size}>
                  {size}
                </option>
              ))
            ) : (
              <option>No Sizes Available</option>
            )}
          </select>

          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            max={10}
            min={1}
          />
          <AddToCartButton
            productId={product._id}
            quantity={quantity}
            sizeChosen={selectedSize}
          />
          <h4>Product Details</h4>
          <span>{product.description}</span>
        </div>

        {/* {Mobile details} */}
        <div className="single-pro-details-mobile">
          <h4 className="product-name-mobile">{product.name}</h4>
          <h2 className="product-price-mobile">${product.price}</h2>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "20px",
            }}
          >
            <select
              className="product-size-select-mobile"
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
            >
              <option value="">Select Size</option>
              {product.size && product.size.length > 0 ? (
                product.size.map((size, index) => (
                  <option key={index} value={size}>
                    {size}
                  </option>
                ))
              ) : (
                <option>No Sizes Available</option>
              )}
            </select>

            <input
              type="number"
              className="product-quantity-mobile"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              max={10}
              min={1}
            />
            <AddToCartButton
              productId={product._id}
              quantity={quantity}
              sizeChosen={selectedSize}
            />
          </div>
          <h4 className="product-details-heading-mobile">Product Details</h4>
          <span className="product-description-mobile">
            {product.description}
          </span>
        </div>
      </section>

      <section
        id="product1"
        className="section-p1"
        style={{ marginTop: "50px", marginBottom: "100px" }}
      >
        <h2 style={{ marginBottom: "20px" }}>You May Like</h2>
        <div id="itemsCard">
          {randomItems.map((item) => (
            <ItemCard key={item._id} item={item} />
          ))}
        </div>
      </section>
    </Fragment>
  );
};

export default ProductDisplay;
