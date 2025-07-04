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
  const [loadingImages, setLoadingImages] = useState();
  const { setYourItems } = useContext(YourItemsContext);
  const { setFavoriteItems } = useContext(FavoriteContext);
  const { setCartItems } = useContext(CartContext);
  const { setData } = useContext(DataContext);
  const [oldImages, setOldImages] = useState({});
  const { id } = useParams();
  const token = localStorage.getItem("authToken");

  // saving to localstorage only when the use make a manual change.
  const [shouldSyncToLocalStorage, setShouldSyncToLocalStorage] =
    useState(false);

  // Initial form data structure
  const initialFormData = {
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

  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem(`formDataEdit_${id}`);
    return saved ? JSON.parse(saved) : initialFormData;
  });

  useEffect(() => {
    setOldImages({
      image1: formData.image1,
      image2: formData.image2,
      image3: formData.image3,
      image4: formData.image4,
      image5: formData.image5,
    });
  }, [formData]);

  const [originalFormData, setOriginalFormData] = useState(null); // To store the original fetched data

  // Fetch existing item data to populate the form
  useEffect(() => {
    const fillEditFormWithExistingItemData = async () => {
      try {
        const localData = JSON.parse(
          localStorage.getItem(`formDataEdit_${id}`)
        );
        const localOriginal = JSON.parse(
          localStorage.getItem(`originalFormDataEdit_${id}`)
        );

        if (localData && localOriginal) {
          const parsedFormData = JSON.parse(localData);
          const parsedOriginalData = JSON.parse(localOriginal);
          setFormData(parsedFormData);
          setOriginalFormData(parsedOriginalData);
          setShouldSyncToLocalStorage(true);
          return; // ✅ Skip fetching
        }

        // Otherwise, fetch from backend
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_API}/getYourItemToEdit/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const itemData = response.data;
        const fallbackImage = { url: "", public_id: "" };

        const fetchedData = {
          name: itemData.name || "",
          description: itemData.description || "",
          price: itemData.price || "",
          category: itemData.category || "men",
          subCategory: itemData.subCategory || "Topwear",
          size: itemData.size || [],
          isBestseller: itemData.isBestseller ?? false,
          image1: itemData.image1 || fallbackImage,
          image2: itemData.image2 || fallbackImage,
          image3: itemData.image3 || fallbackImage,
          image4: itemData.image4 || fallbackImage,
          image5: itemData.image5 || fallbackImage,
        };

        setFormData(fetchedData);
        setOriginalFormData(fetchedData);

        // ✅ Save both versions to localStorage
        localStorage.setItem(`formDataEdit_${id}`, JSON.stringify(fetchedData));
        localStorage.setItem(
          `originalFormDataEdit_${id}`,
          JSON.stringify(fetchedData)
        );
        setShouldSyncToLocalStorage(true);
      } catch (error) {
        console.log("There was an error", error);
      }
    };

    fillEditFormWithExistingItemData();
  }, [id, token]);

  // Persist form data in localStorage when formData changes
  useEffect(() => {
    localStorage.setItem(`formDataEdit_${id}`, JSON.stringify(formData));
  }, [formData]);

  // Handle form field changes
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
        )}MB`
      );
      return;
    }

    // Preview for UI (base64)
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        [imageField]: {
          ...prev[imageField],
          url: reader.result, // base64 preview only
          public_id: prev[imageField].public_id, // keep the old one for now
        },
      }));
    };
    reader.readAsDataURL(file);

    // Store selected file for upload later
    setSelectedImages((prev) => ({
      ...prev,
      [imageField]: file,
    }));
  };

  // const uploadImageToCloudinary = async (file) => {
  //   const formData = new FormData();
  //   formData.append("file", file);
  //   formData.append(
  //     "upload_preset",
  //     import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
  //   );
  //   formData.append("folder", "product-images");

  //   const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  //   const response = await fetch(
  //     `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
  //     {
  //       method: "POST",
  //       body: formData,
  //     }
  //   );

  //   const data = await response.json();
  //   console.log("📦 Cloudinary response:", data); // <-- ADD THIS
  //   if (!data.secure_url || !data.public_id) throw new Error("Upload failed");
  //   return data;
  // };

  useEffect(() => {
    console.log("Updated formData:", formData);
  }, [formData]);

  // Submit form data
  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedFormData = { ...formData };

    for (const key of Object.keys(formData)) {
      if (key.startsWith("image")) {
        const image = formData[key];

        // If the image was updated (base64), upload it
        if (image?.url?.startsWith("data:")) {
          try {
            const cloudinaryForm = new FormData();
            cloudinaryForm.append("file", image.url);
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
        } else {
          updatedFormData[key] = {
            url: image?.url || "",
            public_id: image?.public_id || "",
          };
        }
      }
    }

    if (!updatedFormData.image1?.url) {
      toast.error("Main image is required.");
      setLoading(false);
      return;
    }

    await axios
      .put(
        `${import.meta.env.VITE_BACKEND_API}/editYourItem/${id}`,
        updatedFormData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then(async (res) => {
        console.log("Item updated successfully:", res.data);

        // Clear the form data after successful submission
        // setFormData(originalFormData);
        // setFormData(originalFormData);
        localStorage.removeItem(
          `formDataEdit_${id}`,
          JSON.stringify(originalFormData)
        );
        localStorage.removeItem(
          `originalFormDataEdit_${id}`,
          JSON.stringify(originalFormData)
        );
        navigate("/ethereal/profile/yourItems");

        const [favorites, cart, yourItems, homeData] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_API}/favorites/get`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${import.meta.env.VITE_BACKEND_API}/cart`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${import.meta.env.VITE_BACKEND_API}/yourItems/get`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${import.meta.env.VITE_BACKEND_API}/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setFavoriteItems(favorites.data);
        setCartItems(cart.data.items);
        setYourItems(yourItems.data);
        setData(homeData.data);

        toast.success("Item Updated Successfully");
      })
      .catch((err) => {
        console.error("Error updating item:", err);
        toast.error("Failed to Update Item, please try again");
      });
  };

  // Reset changes by restoring the original fetched data
  const resetChanges = () => {
    const originalData = JSON.parse(
      localStorage.getItem(`originalFormDataEdit_${id}`)
    );
    if (originalData) {
      setShouldSyncToLocalStorage(false);
      setFormData(originalData);
      setOriginalFormData(originalData);
      localStorage.setItem(
        `originalFormDataEdit_${id}`,
        JSON.stringify(fetchedData)
      );

      setTimeout(() => setShouldSyncToLocalStorage(true), 100);
    } else {
      toast.error("No original data to reset to.");
    }
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
                {formData[`image${num}`]?.url ? (
                  <img
                    src={formData[`image${num}`].url}
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
                onChange={(e) => handleImageSelect(e, `image${num}`)}
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
