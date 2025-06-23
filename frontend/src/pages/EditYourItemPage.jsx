import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../UploadItemForm.css";
import { toast } from "react-toastify";
import { FavoriteContext } from "../context/FavoriteContext";
import { YourItemsContext } from "../context/YourItemsContext";
import { CartContext } from "../context/CartContext";
import { DataContext } from "../context/DataContext";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import app from "../firebase-config";

const EditYourItemPage = () => {
  const navigate = useNavigate();
  const storage = getStorage(app);
  const { setYourItems } = useContext(YourItemsContext);
  const { setFavoriteItems } = useContext(FavoriteContext);
  const { setCartItems } = useContext(CartContext);
  const { setData } = useContext(DataContext);
  const [oldImages, setOldImages] = useState({});
  const { id } = useParams();
  const token = localStorage.getItem("authToken");
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

  useEffect(() => {
    // Set the old image URLs when loading the item for editing
    setOldImages({
      image1: formData.image1 || "",
      image2: formData.image2 || "",
      image3: formData.image3 || "",
      image4: formData.image4 || "",
      image5: formData.image5 || "",
    });
  }, [formData]);

  const [originalFormData, setOriginalFormData] = useState(null); // To store the original fetched data

  // Fetch existing item data to populate the form
  useEffect(() => {
    const fillEditFormWithExistingItemData = async () => {
      try {
        const response = await axios.get(
          `${process.env.BACKEND_API}/getYourItemToEdit/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

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

  // const handleFileUpload = async (e, imageField) => {
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

  //   try {
  //     // Delete the old image if it exists
  //     if (oldImages[imageField]) {
  //       const oldImageRef = ref(storage, oldImages[imageField]);
  //       await deleteObject(oldImageRef);
  //       console.log(`Deleted old image: ${oldImages[imageField]}`);
  //     }

  //     // Upload the new file
  //     const storageRef = ref(storage, `uploads/${Date.now()}-${file.name}`);
  //     await uploadBytes(storageRef, file);
  //     const downloadURL = await getDownloadURL(storageRef);

  //     // Update the formData and oldImages state
  //     setFormData((prevData) => ({
  //       ...prevData,
  //       [imageField]: downloadURL, // Store the new image URL
  //     }));

  //     setOldImages((prevOldImages) => ({
  //       ...prevOldImages,
  //       [imageField]: downloadURL, // Update the oldImages with the new URL
  //     }));

  //     toast.success("Image uploaded successfully!");
  //   } catch (error) {
  //     console.error("Error uploading or deleting image:", error);
  //     toast.error("Failed to upload image.");
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

  const handleFileUpload = async (e, imageField) => {
    const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB max
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

    if (file.size > MAX_FILE_SIZE) {
      toast.error(
        `File too large. Your file is ${(file.size / (1024 * 1024)).toFixed(
          2
        )}MB, max allowed is 20MB.`
      );
      return;
    }

    try {
      setLoadingImages((prev) => ({ ...prev, [imageField]: true }));

      // --- Upload to Cloudinary ---
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
        }/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      console.log("Cloudinary Response:", data);

      if (!data.secure_url) throw new Error("Cloudinary upload failed");

      // Optional: Delete old image (requires public_id, which is not a URL)
      if (oldImages[imageField]?.public_id) {
        console.warn(
          "Note: Cloudinary image deletion must be done securely from backend using the public_id:",
          oldImages[imageField].public_id
        );
        // Call your backend here if you implement deletion logic
      }

      // Save image URL and public_id
      setFormData((prevData) => ({
        ...prevData,
        [imageField]: data.secure_url, // image URL
      }));

      setOldImages((prev) => ({
        ...prev,
        [imageField]: {
          url: data.secure_url,
          public_id: data.public_id, // needed for deletion
        },
      }));

      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Error uploading image to Cloudinary:", error);
      toast.error("Failed to upload image.");
    } finally {
      setLoadingImages((prev) => ({ ...prev, [imageField]: false }));
    }
  };

  // Submit form data
  const handleSubmit = (e) => {
    e.preventDefault();

    axios
      .put(`${process.env.BACKEND_API}/editYourItem/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(async (res) => {
        console.log("Item updated successfully:", res.data);

        // Clear the form data after successful submission
        setFormData(originalFormData);
        localStorage.setItem("formDataEdit", JSON.stringify(originalFormData));
        navigate("/ethereal/profile/yourItems");

        // Updating favorite items, cart, and your items
        const updatedFavoriteItems = await axios.get(
          `${process.env.BACKEND_API}/favorites/get`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setFavoriteItems(updatedFavoriteItems.data);

        const updatedCartItems = await axios.get(
          `${process.env.BACKEND_API}/cart`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCartItems(updatedCartItems.data.items);

        const updatedYourItems = await axios.get(
          `${process.env.BACKEND_API}/yourItems/get`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setYourItems(updatedYourItems.data);

        const updatedData = await axios.get(`${process.env.BACKEND_API}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
