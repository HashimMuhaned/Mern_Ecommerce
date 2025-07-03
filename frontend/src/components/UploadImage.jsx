import React, { useState, useContext, useEffect, useRef } from "react";
import axios from "axios";
import "../UploadItemForm.css";
import { toast } from "react-toastify";
import { YourItemsContext } from "../context/YourItemsContext";
import { DataContext } from "../context/DataContext";
import { NavLink } from "react-router-dom";
import { CheckUserContext } from "../context/CheckUserToken";
// import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
// import app from "../firebase-config";
import SpinnersForUploadFiles from "./SpinnersForUploadFiles";
// import SpinnersForBtn from "./SpinnersForBtn";

const AddItemForm = () => {
  // const storage = getStorage(app);

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

  const fileInputRefs = {
    image1: useRef(null),
    image2: useRef(null),
    image3: useRef(null),
    image4: useRef(null),
    image5: useRef(null),
  };

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
        [imageField]: { url: reader.result, public_id: "" },
      }));
    };
    reader.readAsDataURL(file);
  };

  // Retrieve form data from local storage or set default values
  const initialFormData = JSON.parse(
    localStorage.getItem(`formData_${token}`)
  ) || {
    name: "",
    description: "",
    price: "",
    category: "men",
    subCategory: "Top Wear",
    size: [],
    isBestseller: false,
    image1: { url: "", public_id: "" },
    image2: { url: "", public_id: "" },
    image3: { url: "", public_id: "" },
    image4: { url: "", public_id: "" },
    image5: { url: "", public_id: "" },
  };

  const [formData, setFormData] = useState(initialFormData);

  // Update local storage whenever formData changes
  useEffect(() => {
    localStorage.setItem(`formData_${token}`, JSON.stringify(formData));
  }, [formData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updatedFormData = { ...formData };

      for (const key of Object.keys(formData)) {
        if (key.startsWith("image")) {
          const image = formData[key];

          // If image has a base64 URL, upload it directly
          if (image?.url?.startsWith("data:")) {
            try {
              const cloudinaryForm = new FormData();
              cloudinaryForm.append("file", image.url); // base64 string
              cloudinaryForm.append(
                "upload_preset",
                import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
              );
              cloudinaryForm.append("folder", "product-images");

              const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
              const res = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
                {
                  method: "POST",
                  body: cloudinaryForm,
                }
              );

              const data = await res.json();

              if (!data.secure_url || !data.public_id) {
                throw new Error("Cloudinary upload failed");
              }

              updatedFormData[key] = {
                url: data.secure_url,
                public_id: data.public_id,
              };
            } catch (err) {
              console.error(`Upload failed for ${key}:`, err);
              toast.error(`Failed to upload ${key}`);
              setLoading(false);
              return;
            }
          }
        }
      }

      // Ensure at least image1 has been uploaded
      if (!updatedFormData.image1?.url) {
        toast.error("Main image is required.");
        setLoading(false);
        return;
      }

      console.log("Sending form data:", updatedFormData);

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_API}/upload-item`,
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
      console.error("🔥 Error submitting form:", error);
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
      image1: { url: "", public_id: "" },
      image2: { url: "", public_id: "" },
      image3: { url: "", public_id: "" },
      image4: { url: "", public_id: "" },
      image5: { url: "", public_id: "" },
    });

    setSelectedImages({
      image1: null,
      image2: null,
      image3: null,
      image4: null,
      image5: null,
    });

    // 🔁 Reset file input values manually
    Object.keys(fileInputRefs).forEach((key) => {
      if (fileInputRefs[key].current) {
        fileInputRefs[key].current.value = null;
      }
    });

    localStorage.removeItem(`formData_${token}`);
  };

  if (isLoggedin === false) {
    return (
      <p id="login_to_view">
        Please{" "}
        <NavLink
          to={"/ethereal/login"}
          style={{ color: "blue", textDecoration: "underline" }}
        >
          Login.
        </NavLink>
      </p>
    );
  }

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
                ) : formData[`image${num}`]?.url ? (
                  <img
                    src={formData[`image${num}`].url}
                    alt={`Preview ${num}`}
                    className="image-preview"
                  />
                ) : (
                  <p>{num === 1 ? "Main Image" : `Image ${num}`}</p>
                )}
              </label>
              <input
                type="file"
                ref={fileInputRefs[`image${num}`]}
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
