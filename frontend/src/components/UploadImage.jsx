import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import "../UploadItemForm.css";
import { toast } from "react-toastify";
import { YourItemsContext } from "../context/YourItemsContext";
import { DataContext } from "../context/DataContext";
import { NavLink } from "react-router-dom";
import { CheckUserContext } from "../context/CheckUserToken";
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const AddItemForm = () => {
  const firebaseConfig = {
    apiKey: process.env.apiKey,
    authDomain: process.env.authDomain,
    projectId: process.env.projectId,
    storageBucket: "ethereal-1a9e9.appspot.com",
    messagingSenderId: process.env.messagingSenderId,
    appId: process.env.appId,
    measurementId: process.env.measurementId,
  };

  console.log("Firebase Config:", firebaseConfig);
  console.log("Storage Bucket:", firebaseConfig.storageBucket);

  const app = initializeApp(firebaseConfig);
  const storage = getStorage(app);

  const { setYourItems } = useContext(YourItemsContext);
  const { setData } = useContext(DataContext);
  const { isLoggedin } = useContext(CheckUserContext);
  const token = localStorage.getItem("authToken");

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

    // Validate file type
    const allowedFileTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/jpg",
    ];
    if (!allowedFileTypes.includes(file.type)) {
      toast.error("Invalid file type. Only JPEG, PNG, or GIF allowed.");
      return;
    }

    try {
      // Create a storage reference
      const storageRef = ref(storage, `uploads/${Date.now()}-${file.name}`);

      // Upload the file
      await uploadBytes(storageRef, file);

      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);

      // Update the form data with the download URL
      setFormData((prevData) => ({
        ...prevData,
        [imageField]: downloadURL, // Store the URL instead of the file object
      }));

      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Error uploading file to Firebase:", error);
      toast.error("Failed to upload image. Please try again.");
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
    e.preventDefault();

    if (loading) return; // Prevent multiple submissions

    setLoading(true);

    // Send form data with image URLs to the backend
    try {
      const response = await axios.post(
        `${process.env.BACKEND_API}/upload-item`,
        {
          ...formData,
          size: JSON.stringify(formData.size), // Convert array to string if required by backend
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 201) {
        toast.success("Item created successfully!");

        // Reset form
        clearFormInputs();
        fetchYourItems();
        fetchHomePageItems();
      } else {
        toast.error("Unexpected response from server.");
      }
    } catch (err) {
      console.error("Error Response:", err.response || err.message);
      toast.error(
        err.response?.data?.message || "Failed to add item, please try again"
      );
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
                {formData[`image${num}`] ? (
                  <img
                    src={formData[`image${num}`]}
                    alt={`Preview ${num}`}
                    className="image-preview"
                  />
                ) : (
                  <div>
                    {num === 1 ? (
                      <p>Main Image</p>
                    ) : (
                      <p style={{ paddingLeft: "10px" }}>Upload Image {num}</p>
                    )}
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
