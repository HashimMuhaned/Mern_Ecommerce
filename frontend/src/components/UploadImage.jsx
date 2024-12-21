import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import "../UploadItemForm.css";
import { toast } from "react-toastify";
import { YourItemsContext } from "../context/YourItemsContext";
import { DataContext } from "../context/DataContext";
import { NavLink } from "react-router-dom";
import { CheckUserContext } from "../context/CheckUserToken";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import app from "../firebase-config";
import SpinnersForBtn from "./SpinnersForBtn";

const AddItemForm = () => {
  const storage = getStorage(app);

  const { setYourItems } = useContext(YourItemsContext);
  const { setData } = useContext(DataContext);
  const { isLoggedin } = useContext(CheckUserContext);
  const token = localStorage.getItem("authToken");
  const [loadingImages, setLoadingImages] = useState({
    image1: false,
    image2: false,
    image3: false,
    image4: false,
    image5: false,
  });

  if (!isLoggedin) {
    return (
      <p id="login_to_view">
        Please{" "}
        <NavLink
          to={"/ethereal/login"}
          style={{ color: "blue", textDecoration: "underline" }}
        >
          {" "}
          Login.
        </NavLink>
      </p>
    );
  }
  // Retrieve form data from local storage or set default values
  const initialFormData = JSON.parse(localStorage.getItem("formData")) || {
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

  const [formData, setFormData] = useState(initialFormData);

  // Clear formDataEdit from local storage on component mount
  useEffect(() => {
    localStorage.removeItem("formDataEdit");
  }, []);

  // Update local storage whenever formData changes
  useEffect(() => {
    localStorage.setItem("formData", JSON.stringify(formData));
  }, [formData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileUpload = async (e, imageField) => {
    const file = e.target.files[0];

    if (!file) return;

    const allowedFileTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/jpg",
    ];
    if (!allowedFileTypes.includes(file.type)) {
      toast.error("Invalid file type. Only JPEG, PNG, JPG, or GIF allowed.");
      return;
    }

    try {
      // Set loading for the specific image
      setLoadingImages((prevState) => ({
        ...prevState,
        [imageField]: true,
      }));

      const storageRef = ref(storage, `uploads/${Date.now()}-${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      setFormData((prevData) => ({
        ...prevData,
        [imageField]: downloadURL, // Store URL instead of the file object
      }));

      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload image.");
    } finally {
      // Reset loading for the specific image
      setLoadingImages((prevState) => ({
        ...prevState,
        [imageField]: false,
      }));
    }
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

  const fetchYourItems = async () => {
    try {
      const response = await axios.get(
        `${process.env.BACKEND_API}/yourItems/get`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setYourItems(response.data);
    } catch (error) {
      console.error("Error fetching items after creation:", error);
    }
  };

  const fetchHomePageItems = async () => {
    try {
      const response = await axios.get(`${process.env.BACKEND_API}`);
      setData(response.data);
    } catch (error) {
      console.log("Error fetching home page items", err);
    }
  };

  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();

    try {
      const response = await axios.post(
        `${process.env.BACKEND_API}/upload-item`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        toast.success("Item created successfully!");
        clearFormInputs(); // Reset form
        fetchYourItems(); // Reload your items
        fetchHomePageItems(); // Reload home page items
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to create item.");
    } finally {
      setLoading(false);
    }
  };

  const clearFormInputs = () => {
    setFormData({
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
    });
    localStorage.removeItem("formData");
  };

  return (
    <div className="form-container">
      <form className="add-item-form" onSubmit={handleSubmit}>
        {/* Image Inputs */}
        <label>Upload Images</label>
        <div className="image-upload-grid">
          {[1, 2, 3, 4, 5].map((num) => (
            <div key={num} className="image-upload-box">
              <label htmlFor={`file-upload-${num}`}>
                {loadingImages[`image${num}`] ? (
                  <div className="spinner-overlay">
                    <SpinnersForBtn />
                  </div>
                ) : formData[`image${num}`] ? (
                  <img
                    src={formData[`image${num}`]}
                    alt={`Preview ${num}`}
                    className="image-preview"
                  />
                ) : (
                  <p>{num === 1 ? "Main Image" : `Upload Image ${num}`}</p>
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
          placeholder="Product name"
          value={formData.name}
          onChange={handleInputChange}
          required
        />

        <textarea
          name="description"
          placeholder="Product description"
          value={formData.description}
          onChange={handleInputChange}
          required
        />

        <div className="form-row">
          <div>
            <label>
              <span id="prod-span">Product</span> Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
            >
              <option value="men">Men</option>
              <option value="women">Women</option>
              <option value="kids">Kids</option>
              <option value="home">Home Essentials</option>
              <option value="accessories">Accessories</option>
              <option value="beauty">Beauty</option>
              <option value="electronics">Electronics</option>
            </select>
          </div>
          <div>
            <label>Sub category</label>
            <select
              name="subCategory"
              value={formData.subCategory}
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
              placeholder="Product Price"
              value={formData.price}
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
            checked={formData.isBestseller}
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
            ADD
          </button>
          <button type="button" className="clear-btn" onClick={clearFormInputs}>
            Clear Form
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddItemForm;
