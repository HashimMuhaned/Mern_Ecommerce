import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../UploadItemForm.css";
import { toast } from "react-toastify";
import { FavoriteContext } from "../context/FavoriteContext";
import { YourItemsContext } from "../context/YourItemsContext";
import { CartContext } from "../context/CartContext";
import { DataContext } from "../context/DataContext";

const EditYourItemPage = () => {
  const navigate = useNavigate();
  const { setYourItems } = useContext(YourItemsContext);
  const { setFavoriteItems } = useContext(FavoriteContext);
  const { setCartItems } = useContext(CartContext);
  const { setData } = useContext(DataContext);
  const { id } = useParams();
  // Initial form data structure
  const initialFormData = {
    name: "",
    description: "",
    price: "",
    category: "men",
    subCategory: "Top Wear",
    size: [],
    isBestseller: false,
    image1: "",
    image2: "",
    image3: "",
    image4: "",
    image5: "",
  };

  const [formData, setFormData] = useState(
    JSON.parse(localStorage.getItem("formDataEdit")) || initialFormData
  );
  const [originalFormData, setOriginalFormData] = useState(null); // To store the original fetched data

  // Fetch existing item data to populate the form
  useEffect(() => {
    const fillEditFormWithExistingItemData = async () => {
      try {
        const response = await axios.get(`/api/getYourItemToEdit/${id}`, {
          withCredentials: true,
        });

        const itemData = response.data;
        const fetchedData = {
          name: itemData.name || "",
          description: itemData.description || "",
          price: itemData.price || "",
          category: itemData.category || "men",
          subCategory: itemData.subCategory || "Topwear",
          size: itemData.size || [],
          isBestseller: itemData.isBestseller || false,
          image1: itemData.image1 || "",
          image2: itemData.image2 || "",
          image3: itemData.image3 || "",
          image4: itemData.image4 || "",
          image5: itemData.image5 || "",
        };

        setFormData(fetchedData); // Set form data for editing
        setOriginalFormData(fetchedData); // Store the original data
        localStorage.setItem("formDataEdit", JSON.stringify(fetchedData)); // Update localStorage
      } catch (error) {
        console.log("There was an error", error);
      }
    };

    // Always fetch the data, even if there's data in localStorage
    fillEditFormWithExistingItemData();
  }, [id]);

  // Persist form data in localStorage when formData changes
  useEffect(() => {
    localStorage.setItem("formDataEdit", JSON.stringify(formData));
  }, [formData]);

  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileUpload = (e, imageField) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      setFormData((prevData) => ({
        ...prevData,
        [imageField]: reader.result, // Store the base64 string
      }));
    };
    reader.readAsDataURL(file); // Convert the file to base64
  };

  const handleCheckboxChange = (e) => {
    setFormData({ ...formData, isBestseller: e.target.checked });
  };

  const handleSizeChange = (size) => {
    const selectedSizes = [...formData.size];
    if (selectedSizes.includes(size)) {
      setFormData({
        ...formData,
        size: selectedSizes.filter((s) => s !== size),
      });
    } else {
      selectedSizes.push(size);
      setFormData({ ...formData, size: selectedSizes });
    }
  };

  // Submit form data
  const handleSubmit = (e) => {
    e.preventDefault();

    axios
      .put(`/api/editYourItem/${id}`, formData)
      .then(async (res) => {
        console.log("Item updated successfully:", res.data);

        // Clear the form data after successful submission
        setFormData(originalFormData); // Reset form to the original data
        localStorage.setItem("formDataEdit", JSON.stringify(originalFormData)); // Update localStorage with original data
        navigate("/ethereal/profile/yourItems");

        // Updating favorite items, cart, and your items to reflect the changes
        const updatedFavoriteItems = await axios.get("/api/favorites/get", {
          withCredentials: true,
        });
        setFavoriteItems(updatedFavoriteItems.data);

        const updatedCartItems = await axios.get("/api/cart", {
          withCredentials: true,
        });
        setCartItems(updatedCartItems.data.items);

        const updatedYourItems = await axios.get("/api/yourItems/get", {
          withCredentials: true,
        });
        setYourItems(updatedYourItems.data);

        const updatedData = await axios.get("/api", {
          withCredentials: true,
        });
        setData(updatedData.data);

        toast.success("Item Updated Successfully");
      })
      .catch((err) => {
        console.error("Error updating item:", err);
        toast.error("Failed to Update Item, please try again");
      });
  };

  // Reset changes by restoring the original fetched data
  const resetChanges = () => {
    setFormData(originalFormData);
    localStorage.setItem("formDataEdit", JSON.stringify(originalFormData));
  };

  return (
    <div className="form-container">
      <form className="add-item-form" onSubmit={handleSubmit}>
        {/* Image Inputs */}
        <label>Edit Images</label>
        <div className="image-upload-grid">
          {[1, 2, 3, 4, 5].map((num) => (
            <div key={num} className="image-upload-box">
              <label htmlFor={`file-upload-${num}`}>
                {formData[`image${num}`] ? (
                  <img
                    src={formData[`image${num}`]}
                    alt={`Preview ${num}`}
                    className="image-preview"
                  />
                ) : (
                  <div>
                    {num === 1 ? <p>Main Image</p> : <p>Edit Image {num}</p>}
                  </div>
                )}
              </label>
              <input
                type="file"
                id={`file-upload-${num}`}
                style={{ display: "none" }}
                onChange={(e) => handleFileUpload(e, `image${num}`)}
              />
            </div>
          ))}
        </div>

        {/* Other Input Fields */}
        <input
          type="text"
          name="name"
          value={formData.name} // Bind the value to state
          placeholder="Product name"
          onChange={handleInputChange}
          required
        />

        <textarea
          name="description"
          value={formData.description} // Bind the value to state
          placeholder="Product description"
          onChange={handleInputChange}
          required
        />

        <div className="form-row">
          <div>
            <label>Product category</label>
            <select
              name="category"
              value={formData.category} // Bind the value to state
              onChange={handleInputChange}
              required
            >
              <option value="men">Men</option>
              <option value="women">Women</option>
            </select>
          </div>

          <div>
            <label>Sub category</label>
            <select
              name="subCategory"
              value={formData.subCategory} // Bind the value to state
              onChange={handleInputChange}
              required
            >
              <option value="Topwear">Topwear</option>
              <option value="Bottomwear">Bottomwear</option>
            </select>
          </div>

          <div>
            <label>Product Price</label>
            <input
              type="number"
              name="price"
              value={formData.price} // Bind the value to state
              placeholder="Product Price"
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="product-sizes">
          <label>Product Sizes</label>
          <div className="size-buttons">
            {["S", "M", "L", "XL", "XXL"].map((size) => (
              <button
                key={size}
                type="button"
                className={`size-button ${
                  formData.size.includes(size) ? "selected" : ""
                }`}
                onClick={() => handleSizeChange(size)}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div className="bestseller-checkbox">
          <input
            type="checkbox"
            id="bestseller"
            name="isBestseller"
            checked={formData.isBestseller} // Bind the checkbox state
            onChange={handleCheckboxChange}
          />
          <label htmlFor="bestseller">Add to bestseller</label>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <button type="submit" className="submit-btn">
            Update Item
          </button>
          <button type="button" className="clear-btn" onClick={resetChanges}>
            Reset Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditYourItemPage;
