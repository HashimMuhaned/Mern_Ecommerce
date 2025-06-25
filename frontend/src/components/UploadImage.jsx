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
import SpinnersForUploadFiles from "./SpinnersForUploadFiles";
// import SpinnersForBtn from "./SpinnersForBtn";

const AddItemForm = () => {
  const storage = getStorage(app);

  const { setYourItems } = useContext(YourItemsContext);
  const { setData } = useContext(DataContext);
  const { isLoggedin } = useContext(CheckUserContext);
  const token = localStorage.getItem("authToken");
  const [loading, setLoading] = useState(false);
  const [loadingImages, setLoadingImages] = useState({
    image1: false,
    image2: false,
    image3: false,
    image4: false,
    image5: false,
  });

  const [selectedImages, setSelectedImages] = useState({
    image1: null,
    image2: null,
    image3: null,
    image4: null,
    image5: null,
  });

  const handleImageSelect = (e, imageField) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedFileTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/jpg",
    ];
    const MAX_FILE_SIZE = 20 * 1024 * 1024;

    if (!allowedFileTypes.includes(file.type)) {
      toast.error("Invalid file type. Only JPEG, PNG, JPG, or GIF allowed.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error(
        `File too large. Your file is ${(file.size / (1024 * 1024)).toFixed(
          2
        )}MB, max allowed is 20MB.`
      );
      return;
    }

    setSelectedImages((prev) => ({
      ...prev,
      [imageField]: file,
    }));

    // Optional: show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prevData) => ({
        ...prevData,
        [imageField]: reader.result, // preview only
      }));
    };
    reader.readAsDataURL(file);
  };

  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
    );
    formData.append("folder", "product-images");

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${
        import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
      }/image/upload`,
      { method: "POST", body: formData }
    );

    const data = await response.json();
    if (!data.secure_url) throw new Error("Cloudinary upload failed");
    return data.secure_url;
  };

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

  // const handleFileUpload = async (e, imageField) => {
  //   const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
  //   const file = e.target.files[0];
  //   if (!file) return;

  //   const allowedFileTypes = [
  //     "image/jpeg",
  //     "image/png",
  //     "image/gif",
  //     "image/jpg",
  //   ];
  //   if (!allowedFileTypes.includes(file.type)) {
  //     toast.error("Invalid file type. Only JPEG, PNG, JPG, or GIF allowed.");
  //     return;
  //   }

  //   if (file.size > MAX_FILE_SIZE) {
  //     toast.error(
  //       `File too large. Your file is ${(file.size / (1024 * 1024)).toFixed(
  //         2
  //       )}MB, max allowed is 20MB.`
  //     );
  //     return;
  //   }

  //   try {
  //     setLoadingImages((prevState) => ({
  //       ...prevState,
  //       [imageField]: true,
  //     }));

  //     const formData = new FormData();
  //     formData.append("file", file);
  //     formData.append(
  //       "upload_preset",
  //       import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
  //     ); // unsigned preset
  //     formData.append("folder", "product-images"); // your target folder
  //     // formData.append("cloud_name", import.meta.env.VITE_CLOUDINARY_CLOUD_NAME); // not mandatory, just for clarity

  //     const response = await fetch(
  //       `https://api.cloudinary.com/v1_1/${
  //         import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  //       }/image/upload`,
  //       {
  //         method: "POST",
  //         body: formData,
  //       }
  //     );

  //     const data = await response.json();
  //     console.log("Cloudinary Response:", data);

  //     if (data && data.secure_url) {
  //       setFormData((prevData) => ({
  //         ...prevData,
  //         [imageField]: data.secure_url,
  //       }));
  //       toast.success("Image uploaded successfully!");
  //     } else {
  //       throw new Error("Cloudinary upload failed");
  //     }
  //   } catch (error) {
  //     console.error("Error uploading file:", error);
  //     toast.error("Failed to upload image.");
  //   } finally {
  //     setLoadingImages((prevState) => ({
  //       ...prevState,
  //       [imageField]: false,
  //     }));
  //   }
  // };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Start with a full copy of the existing formData
      const updatedFormData = { ...formData };

      // Upload selected image files and replace their values in formData
      for (const key of Object.keys(selectedImages)) {
        const file = selectedImages[key];
        if (file) {
          try {
            const url = await uploadImageToCloudinary(file);
            updatedFormData[key] = url; // update the image field
          } catch (err) {
            toast.error(`Failed to upload ${key}`);
            setLoading(false);
            return;
          }
        }
      }

      // Now submit the full formData with updated image URLs
      const response = await axios.post(
        `${process.env.BACKEND_API}/upload-item`,
        updatedFormData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        toast.success("Item created successfully!");
        clearFormInputs();
        fetchYourItems();
        fetchHomePageItems();
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
        <label
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            marginBottom: "10px",
          }}
        >
          Upload Images
        </label>
        <div className="image-upload-grid">
          {[1, 2, 3, 4, 5].map((num) => (
            <div key={num} className="image-upload-box">
              <label htmlFor={`file-upload-${num}`}>
                {loadingImages[`image${num}`] ? (
                  <div className="spinner-overlay">
                    <SpinnersForUploadFiles />
                  </div>
                ) : formData[`image${num}`] ? (
                  <img
                    src={formData[`image${num}`]}
                    alt={`Preview ${num}`}
                    className="image-preview"
                  />
                ) : (
                  <p>{num === 1 ? "Main Image" : `Image ${num}`}</p>
                )}
              </label>
              <input
                type="file"
                id={`file-upload-${num}`}
                style={{ display: "none" }}
                onChange={(e) => handleImageSelect(e, `image${num}`)}
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
          <button
            type="submit"
            className={`submit-btn ${loading ? "loading" : ""}`}
            disabled={loading}
          >
            Add Item
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
