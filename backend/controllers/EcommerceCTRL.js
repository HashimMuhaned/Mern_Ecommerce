const mongoose = require("mongoose");
const UserModel = require("../model/UserModel.js");
const ItemModel = require("../model/ItemModel.js");
const Cart = require("../model/CartModel.js");
const jwt = require("jsonwebtoken");
const Favorite = require("../model/FavoritesModel.js");
const Order = require("../model/OrdersModel.js");
require("dotenv").config();
const bcrypt = require("bcrypt");
const token_SECRET_KEY = process.env.TOKEN_SECRET_KEY;
const apppassword = process.env.APPPASSWORD;
// const gmail_user = process.env.GMAIL_USER;
const maxAge = 60 * 60 * 24 * 3; // three days
const crypto = require("crypto");
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const sgMail = require("@sendgrid/mail");
const mailSender = process.env.SENDGRID_FROM_EMAIL;

sgMail.setApiKey(SENDGRID_API_KEY);

// const checkUserToken = (req, res, next) => {
//   const token = req.cookies.cookie; // Accessing the JWT from the cookie

//   if (!token) {
//     return res.status(401).json({ valid: false, message: "Token is missing" });
//   }

//   jwt.verify(token, token_SECRET_KEY, (err, decoded) => {
//     if (err) {
//       return res
//         .status(401)
//         .json({ valid: false, message: "Invalid or expired token" });
//     }
//     res.json({ valid: true, user: decoded });
//     next()
//   });
// };

const checkUserToken = (req, res, next) => {
  const token = req.cookies.cookie;
  // console.log("Token received:", token); // Debugging line

  if (!token) {
    console.log("No token found, unauthorized access.");
    return res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify(token, token_SECRET_KEY, (err, decoded) => {
    if (err) {
      console.log("Token verification failed:", err.message);
      return res.status(401).json({ message: "Unauthorized" });
    }

    // console.log("Token verified successfully:", decoded); // Debugging line
    req.userId = decoded.id; // Assuming the JWT contains the user's id
    next();
  });
};

const createToken = (id) => {
  return jwt.sign({ id }, "this the best marketplace ethereal", {
    expiresIn: maxAge,
  });
};

const createItem = async (req, res) => {
  try {
    // Destructure the request body to get item details
    const {
      name,
      description,
      price,
      category,
      subCategory,
      size,
      isBestseller,
      image1,
      image2,
      image3,
      image4,
      image5,
    } = req.body;

    // Get the userId from the request (assuming it's attached via middleware, e.g., after JWT verification)
    const userId = req.userId;

    // Ensure required fields are provided
    if (
      !name ||
      !description ||
      !price ||
      !category ||
      !subCategory ||
      !size.length ||
      !image1
    ) {
      return res
        .status(400)
        .json({ message: "Please fill all required fields" });
    }

    // Create a new item
    const newItem = new ItemModel({
      name,
      description,
      price,
      category,
      subCategory,
      size,
      isBestseller,
      image1, // Main image
      image2, // Additional images
      image3,
      image4,
      image5,
      user: userId, // Set the user who created the item
    });

    // Save the new item to the database
    const savedItem = await newItem.save();

    // Send success response
    res.status(201).json({
      message: "Item created successfully",
      item: savedItem,
    });
  } catch (error) {
    console.error("Error creating item:", error);
    res
      .status(500)
      .json({ message: "An error occurred while creating the item" });
  }
};

const getItems = async (req, res) => {
  try {
    const items = await ItemModel.find({});
    // console.log(items);
    res.status(201).json(items);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

const createUser = async (req, res) => {
  const { fname, lname, email, password } = req.body;

  const isValidPassword = (password) => {
    return (
      password.length >= 7 &&
      /[a-zA-Z]/.test(password) &&
      /\d/.test(password) &&
      !/\s/.test(password)
    );
  };

  if (!isValidPassword(password)) {
    return res.status(400).json({
      errors: {
        password:
          "Password must be at least 7 characters long, contain at least one letter, one number, and no spaces.",
      },
    });
  }

  try {
    // Check for existing user
    const existingUser = await UserModel.findOne({
      fname: { $regex: new RegExp(`^${fname}$`, "i") },
      lname: { $regex: new RegExp(`^${lname}$`, "i") },
    });

    if (existingUser) {
      return res.status(400).json({
        errors: {
          fname: "A user with this first and last name already exists.",
        },
      });
    }

    // Create a new user
    const newUser = await UserModel.create({
      fname,
      lname,
      email,
      password,
      isActive: false,
    });
    console.log("New user created:", newUser);

    // Generate activation token
    const token = jwt.sign(
      { email: newUser.email },
      process.env.TOKEN_SECRET_KEY,
      {
        expiresIn: "1h",
      }
    );

    // Activation link
    const activationLink = `http://localhost:5173/ethereal/activate-account?token=${token}`;

    // Send activation email using SendGrid
    const msg = {
      to: newUser.email,
      from: "hashimcode123@gmail.com", // Verified sender email
      subject: "Account Activation - Ethereal Marketplace",
      html: `
        <h3>Hi ${newUser.fname} ${newUser.lname},</h3>
        <p>Please click the link below to activate your account:</p>
        <a href="${activationLink}">Activate Account</a>
        <p>This link will expire in 1 hour.</p>
      `,
    };

    try {
      await sgMail.send(msg);
      console.log("Activation email sent successfully");
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
      return res
        .status(500)
        .json({ message: "Failed to send activation email" });
    }

    // Success response
    res.status(201).json({
      message:
        "Account created. Please check your email to activate your account.",
    });
  } catch (err) {
    console.error("Error during user creation:", err);

    if (err.name === "ValidationError") {
      let errors = {};
      Object.keys(err.errors).forEach((key) => {
        errors[key] = err.errors[key].message;
      });
      return res.status(400).json({ errors });
    }

    if (err.code === 11000 && err.keyValue.email) {
      return res.status(400).json({
        errors: { email: "This email is already registered." },
      });
    }

    res.status(500).json({ message: "Server error" });
  }
};

const activateAccount = async (req, res) => {
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token, token_SECRET_KEY);
    const { email } = decoded;

    // Find the user by email and activate their account
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }

    user.isActive = true;
    await user.save();

    res.status(200).json({ message: "Account activated successfully." });
  } catch (error) {
    res.status(400).json({ message: "Invalid or expired activation token." });
  }
};

const userLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await UserModel.login(email, password);

    if (!user.isActive) {
      return res
        .status(403)
        .json({ message: "Please activate your account to log in." });
    }

    const token = createToken(user._id);
    res.cookie("cookie", token, {
      maxAge: maxAge * 1000,
    });

    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error("Login error:", error);

    if (error.message === "incorrect email or password") {
      return res.status(401).json({ message: error.message });
    }

    res.status(500).json({ message: "An unexpected error occurred" });
  }
};

const getCategoryItems = async (req, res) => {
  try {
    const { category } = req.params; // Extract the category from req.params
    const items = await ItemModel.find({ category: category });
    res.status(200).json(items); // Use status 200 for successful GET request
  } catch (error) {
    console.error("Error fetching category items:", error);
    res.status(500).json({ message: "Server error" }); // Send an error response
  }
};

const getProduct = async (req, res) => {
  try {
    const { category, id } = req.params;
    const product = await ItemModel.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product); // Use 200 for a successful GET request
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Server error" }); // Send an error response
  }
};

const addToCart = async (req, res) => {
  const { productId, quantity, sizeChosen } = req.body;
  const userId = req.userId;

  try {
    let cart = await Cart.findOne({ userId });

    if (cart) {
      // Check if product already exists in cart
      const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
      );

      if (itemIndex > -1) {
        // If it exists, update the quantity
        cart.items[itemIndex].quantity += quantity;
      } else {
        // If it doesn't exist, add a new item
        cart.items.push({
          productId,
          quantity,
          sizeChosen,
          addedAt: new Date(),
        });
      }
    } else {
      // If no cart exists, create a new one
      cart = new Cart({
        userId,
        items: [{ productId, quantity, sizeChosen, addedAt: new Date() }],
      });
    }

    // Save the updated cart
    await cart.save();

    // Populate the cart items' product details before sending the response
    const populatedCart = await Cart.findOne({ userId }).populate(
      "items.productId"
    );

    return res.status(200).json(populatedCart); // Send populated cart
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};

const getCartItems = async (req, res) => {
  const userId = req.userId;

  try {
    // Find the cart for the user and populate product details including the seller (user)
    const cart = await Cart.findOne({ userId }).populate({
      path: "items.productId",
      select: "name price image1 user", // Include the 'user' field for seller's ObjectId
    });

    // If no cart exists, return a 404 error
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Filter out items where the product has been deleted (i.e., productId is null)
    const validItems = cart.items.filter((item) => item.productId !== null);

    // Check if there were invalid items (i.e., products that were deleted)
    if (validItems.length !== cart.items.length) {
      // Update the cart by keeping only valid items
      cart.items = validItems;
      await cart.save(); // Save the updated cart
    }

    // Return the valid cart items with seller information (productId now contains 'user' as seller)
    return res.status(200).json({ items: validItems });
  } catch (error) {
    // Handle any server errors
    return res.status(500).json({ message: "Server error", error });
  }
};

const deleteCartItem = async (req, res) => {
  const userId = req.userId; // Retrieved from the token in the checkUserToken middleware
  const { productId } = req.params;

  console.log(productId);
  try {
    // Find the user's cart
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Find the index of the item in the cart
    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    // Remove the item from the cart
    cart.items.splice(itemIndex, 1);

    // Save the updated cart
    await cart.save();

    return res.status(200).json({ message: "Item removed from cart" });
  } catch (error) {
    console.error("Error deleting item from cart:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};

const addToFavorite = async (req, res) => {
  const { productId } = req.body;
  const userId = req.userId;

  try {
    let favorite = await Favorite.findOne({ userId });

    if (!favorite) {
      favorite = new Favorite({ userId, items: [{ productId }] });
    } else {
      const itemExists = favorite.items.some(
        (item) => item.productId.toString() === productId
      );

      if (!itemExists) {
        favorite.items.push({ productId, addedAt: new Date() });
      }
    }

    await favorite.save();
    res.status(200).json({ message: "Item added to favorites" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const getFavoriteItems = async (req, res) => {
  const userId = req.userId;
  console.log("User ID:", userId); // Check if userId is present

  try {
    const favorite = await Favorite.findOne({ userId }).populate({
      path: "items.productId",
      select: "_id name price image1 category",
    });

    if (!favorite) {
      return res.status(404).json({ message: "No favorite items found" });
    }

    // Filter out any null or missing products (in case they were deleted)
    const validItems = favorite.items.filter((item) => item.productId !== null);

    res.status(200).json(
      validItems.map((item) => ({
        _id: item.productId._id,
        name: item.productId.name,
        price: item.productId.price,
        image1: item.productId.image1,
        category: item.productId.category,
      }))
    );
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const deleteFavoriteItem = async (req, res) => {
  const { productId } = req.body;
  const userId = req.userId;

  try {
    // Find the user's favorite document
    const favorite = await Favorite.findOne({ userId });

    if (!favorite) {
      return res.status(404).json({ message: "No favorite items found" });
    }

    // Filter out the productId from the items array
    favorite.items = favorite.items.filter(
      (item) => item.productId.toString() !== productId
    );

    // Save the updated favorites list
    await favorite.save();

    res.status(200).json({ message: "Item removed from favorites" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const getUserDetails = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
      _id: user._id,
      fname: user.fname,
      lname: user.lname,
      email: user.email,
      password: user.password,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const checkNameCombination = async (req, res) => {
  const { fname, lname } = req.body;

  try {
    const existingUser = await UserModel.findOne({ fname, lname });

    if (existingUser) {
      return res.status(200).json({ isUnique: false });
    }

    return res.status(200).json({ isUnique: true });
  } catch (error) {
    console.error("Error checking name combination uniqueness:", error);
    return res.status(500).json({ isUnique: false });
  }
};

const updateUserDetails = async (req, res) => {
  try {
    const field = Object.keys(req.body)[0];
    const newName = req.body[field];
    const userId = req.userId;

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user[field] === newName) {
      return res.status(200).json({ message: "No changes were made" });
    }

    user[field] = newName;
    await user.save();

    res.status(200).json({ message: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred" });
  }
};

const checkEmailUnique = async (req, res) => {
  try {
    const { newEmail } = req.body;

    // Check if the new email is already taken by another user
    const existingUser = await UserModel.findOne({ email: newEmail });

    if (existingUser) {
      return res.status(200).json({ isUnique: false });
    }

    return res.status(200).json({ isUnique: true });
  } catch (error) {
    console.error("Error checking email uniqueness:", error);
    return res.status(500).json({ isUnique: false });
  }
};

const updateUserEmail = async (req, res) => {
  try {
    const userId = req.userId;
    const { newEmail } = req.body;

    // Find the user by their ID
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the new email is the same as the current one
    if (user.email === newEmail) {
      return res.status(200).json({ message: "No changes were made" });
    }

    // Update the user's email
    await UserModel.findByIdAndUpdate(user._id, { email: newEmail });
    await user.save();

    const msg = {
      to: newEmail, // New email address
      from: process.env.SENDGRID_FROM_EMAIL, // Verified SendGrid sender email
      subject: "Email Updated Successfully",
      html: `
        <p>You have successfully changed your email address.</p>
        <p>Your email has been updated to <strong>${newEmail}</strong>.</p>
      `,
    };

    // Send the email to notify the user
    try {
      // Send the email to notify the user
      await sgMail.send(msg);
      console.log("Notification email sent successfully");
    } catch (error) {
      console.error("Error sending email:", error);
      return res
        .status(500)
        .json({ message: "Error sending confirmation email." });
    }

    res.status(200).json({ message: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred" });
  }
};

const verifyPassword = async (req, res) => {
  const { password } = req.body;
  const userId = req.userId; // Make sure req.userId is set properly

  try {
    // Find the user by ID
    const user = await UserModel.findById(userId);

    // Check if the user was found
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Compare the provided password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      return res.json({ match: true });
    } else {
      return res.json({ match: false });
    }
  } catch (error) {
    console.error("Error verifying password:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updatePassword = async (req, res) => {
  const { newPassword } = req.body;
  const userId = req.userId; // Ensure req.userId is set

  try {
    // Hash the new password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password in the database
    const user = await UserModel.findByIdAndUpdate(userId, {
      password: hashedPassword,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const tryLoginUrl = `http://localhost:5173/ethereal/login`; // Ensure URL is correct

    // Prepare the email content
    const msg = {
      to: user.email, // Recipient email
      from: process.env.SENDGRID_FROM_EMAIL, // Verified sender email
      subject: "Password Updated Successfully",
      html: `
        <p>Hi ${user.fname},</p>
        <p>You have successfully updated your password.</p>
        <p>Click the link below to login:</p>
        <a href="${tryLoginUrl}" target="_blank">Try to login now</a>
        <p>Make sure you save your password somewhere safe.</p>
        <p>If you didn't request this change, please contact support immediately.</p>
      `,
    };

    // Send the email
    try {
      await sgMail.send(msg);
      console.log("Password update email sent successfully");

      res.status(200).json({
        success: true,
        message: "Password updated successfully. Confirmation email sent.",
      });
    } catch (emailError) {
      console.error("Error sending confirmation email:", emailError);
      res.status(500).json({
        success: false,
        message: "Password updated, but email could not be sent.",
      });
    }
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const itemQuantityUpdate = async (req, res) => {
  const userId = req.userId;
  const { productId, quantity } = req.body;

  if (!productId || quantity < 1) {
    return res.status(400).json({ message: "Invalid product ID or quantity" });
  }

  try {
    // Find the user's cart
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Find the product in the cart's items array
    const productIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (productIndex === -1) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    // Update the quantity
    cart.items[productIndex].quantity = quantity;

    // Save the updated cart
    await cart.save();

    // Repopulate the productId field with item details after the update
    const updatedCart = await Cart.findOne({ userId }).populate(
      "items.productId"
    );

    // Return the updated cart items
    res.status(200).json({ items: updatedCart.items });
  } catch (error) {
    console.error("Error updating cart item:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const itemSizeUpdate = async (req, res) => {
  const { productId, sizeChosen } = req.body; // Extract the selected size from the request body
  const userId = req.userId;

  try {
    console.log(
      "Updating size for User:",
      userId,
      "Product:",
      productId,
      "New Size:",
      sizeChosen
    );

    // Find the cart for the user and update the sizeChosen field for the specific item
    const cart = await Cart.findOneAndUpdate(
      { userId, "items.productId": productId }, // Find the specific item in the cart
      { $set: { "items.$.sizeChosen": sizeChosen } }, // Update the sizeChosen field
      { new: true } // Return the updated cart
    );

    if (!cart) {
      console.log("Cart or item not found for productId:", productId); // Debugging log
      return res.status(404).json({ message: "Cart or item not found" });
    }

    const updatedCart = await Cart.findOne({ userId }).populate(
      "items.productId"
    );

    // Return the updated cart items
    res.status(200).json({ items: updatedCart.items });
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

const yourItems = async (req, res) => {
  try {
    const userId = req.userId;

    const UserItems = await ItemModel.find({ user: userId }).select(
      "_id name price image1 category description subCategory isBestseller size"
    );

    if (!UserItems) res.status(404).json({ message: "user Not found" });

    res.status(200).json(UserItems);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

const getYourItemToEdit = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await ItemModel.findById(id); // Directly find by ID
    if (!item) return res.status(404).json({ message: "Item Not Found" });

    res.status(200).json(item); // Send back item data
  } catch (error) {
    console.log("there was an error", error);
    res.status(500).json({ message: "Error fetching item data" });
  }
};

const editYourItem = async (req, res) => {
  try {
    const { id } = req.params; // Get the item ID from the URL params
    const {
      name,
      description,
      price,
      category,
      subCategory,
      size,
      isBestseller,
      image1,
      image2,
      image3,
      image4,
      image5,
    } = req.body; // Destructure the form data from the request body

    // Find the item by its ID in the database
    const item = await ItemModel.findById(id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Update the item fields with the new data
    item.name = name || item.name;
    item.description = description || item.description;
    item.price = price || item.price;
    item.category = category || item.category;
    item.subCategory = subCategory || item.subCategory;
    item.size = size || item.size;
    item.isBestseller = isBestseller || false;

    // Only update images if a new one was provided, otherwise keep the old one
    item.image1 = image1 || item.image1;
    item.image2 = image2 || item.image2;
    item.image3 = image3 || item.image3;
    item.image4 = image4 || item.image4;
    item.image5 = image5 || item.image5;

    // Save the updated item back to the database
    await item.save();

    // Return the updated item in the response
    res.status(200).json({ message: "Item updated successfully", item });
  } catch (error) {
    console.error("Error updating item:", error);
    res.status(500).json({ message: "Error updating item" });
  }
};

const deleteYourItem = async (req, res) => {
  try {
    const { productId } = req.params; // Extract productId from the request parameters

    // Find the item by productId and delete it
    const deletedItem = await ItemModel.findByIdAndDelete(productId);

    if (!deletedItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    await Favorite.updateMany(
      { "items.productId": productId },
      { $pull: { items: { productId: productId } } }
    );

    await Cart.updateMany(
      { "items.productId": productId },
      { $pull: { items: { productId: productId } } }
    );

    // Send a success response
    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ message: "Error deleting item" });
  }
};

// Increment view count
const incrementView = async (req, res) => {
  try {
    const { productId } = req.params;
    console.log("item id is to increment", productId);

    // Find the item
    const item = await ItemModel.findById(productId);

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    // Add a new view with the current timestamp
    item.viewHistory.push({
      date: new Date(),
      count: 1,
    });

    await item.save();

    res.status(200).json({ message: "View added successfully", item });
  } catch (error) {
    console.error("Error updating views:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// // Increment or decrement cart count
// const updateCartCount = async (itemId, increment = true) => {
//   await Item.findByIdAndUpdate(itemId, {
//     $inc: { cartCount: increment ? 1 : -1 },
//   });
// };

const getViewsLastDay = async (req, res) => {
  try {
    const itemId = req.params.itemId;

    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const item = await ItemModel.findById(itemId);

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    // Filter views from the last 24 hours
    const viewsLastDay = item.viewHistory.filter(
      (view) => new Date(view.date) >= oneDayAgo
    );

    // Group views by 10-minute intervals
    const groupedViews = {};
    viewsLastDay.forEach((view) => {
      const interval = Math.floor(
        new Date(view.date).getTime() / (10 * 60 * 500)
      ); // Group by 10 minutes
      if (!groupedViews[interval]) {
        groupedViews[interval] = 0;
      }
      groupedViews[interval] += view.count;
    });

    // Prepare the response format
    const groupedData = Object.keys(groupedViews).map((interval) => ({
      date: new Date(interval * 10 * 60 * 500), // Convert interval back to date
      count: groupedViews[interval],
    }));

    res.status(200).json({ views: groupedData });
  } catch (error) {
    console.error("Error fetching views:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getViewsLastWeek = async (req, res) => {
  try {
    const itemId = req.params.itemId;

    // Calculate the time for one week ago
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const item = await ItemModel.findById(itemId);

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    // Filter views from the last week
    const viewsLastWeek = item.viewHistory.filter(
      (view) => new Date(view.date) >= oneWeekAgo
    );

    // Group views by week (7-day intervals)
    const groupedViews = {};
    viewsLastWeek.forEach((view) => {
      const interval = Math.floor(
        new Date(view.date).getTime() / (7 * 24 * 60 * 60 * 1000)
      ); // Group by week
      if (!groupedViews[interval]) {
        groupedViews[interval] = 0;
      }
      groupedViews[interval] += view.count;
    });

    // Prepare the response format
    const groupedData = Object.keys(groupedViews).map((interval) => ({
      date: new Date(interval * 7 * 24 * 60 * 60 * 1000), // Convert interval back to date
      count: groupedViews[interval],
    }));

    res.status(200).json({ views: groupedData });
  } catch (error) {
    console.error("Error fetching views:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getViewsLastMonth = async (req, res) => {
  try {
    const itemId = req.params.itemId;

    // Calculate the time for one month ago
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const item = await ItemModel.findById(itemId);

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    // Filter views from the last month
    const viewsLastMonth = item.viewHistory.filter(
      (view) => new Date(view.date) >= oneMonthAgo
    );

    // Group views by month (using month and year for unique key)
    const groupedViews = {};
    viewsLastMonth.forEach((view) => {
      const date = new Date(view.date);
      const interval = `${date.getFullYear()}-${date.getMonth() + 1}`; // Year-Month format
      if (!groupedViews[interval]) {
        groupedViews[interval] = 0;
      }
      groupedViews[interval] += view.count;
    });

    // Prepare the response format
    const groupedData = Object.keys(groupedViews).map((interval) => ({
      date: new Date(interval), // Convert interval back to date (Year-Month)
      count: groupedViews[interval],
    }));

    res.status(200).json({ views: groupedData });
  } catch (error) {
    console.error("Error fetching views:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getViewsLastYear = async (req, res) => {
  try {
    const itemId = req.params.itemId;

    // Calculate the time for one year ago
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const item = await ItemModel.findById(itemId);

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    // Filter views from the last year
    const viewsLastYear = item.viewHistory.filter(
      (view) => new Date(view.date) >= oneYearAgo
    );

    // Group views by year (using year for unique key)
    const groupedViews = {};
    viewsLastYear.forEach((view) => {
      const date = new Date(view.date);
      const interval = `${date.getFullYear()}`; // Group by Year
      if (!groupedViews[interval]) {
        groupedViews[interval] = 0;
      }
      groupedViews[interval] += view.count;
    });

    // Prepare the response format
    const groupedData = Object.keys(groupedViews).map((interval) => ({
      date: new Date(interval, 0), // Convert interval back to date (Year)
      count: groupedViews[interval],
    }));

    res.status(200).json({ views: groupedData });
  } catch (error) {
    console.error("Error fetching views:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getItemFavoritesLastDay = async (req, res) => {
  try {
    const { productId } = req.params;

    // Calculate the timestamp for 24 hours ago
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    // Find all favorite records where the product was added in the last 24 hours
    const favoriteRecords = await Favorite.find({
      "items.productId": productId, // Search for the productId in the items array
      "items.addedAt": { $gte: oneDayAgo }, // Only look for actions within the last 24 hours
    });

    // If no records are found
    if (!favoriteRecords || favoriteRecords.length === 0) {
      return res
        .status(404)
        .json({ error: "No recent favorite actions found for this item." });
    }

    // Prepare an array to store the added timestamps of the item
    const favoriteTimestamps = [];

    // Iterate over each favorite record and collect the timestamps of when the item was added
    favoriteRecords.forEach((favorite) => {
      favorite.items.forEach((item) => {
        if (
          item.productId.toString() === productId &&
          item.addedAt >= oneDayAgo
        ) {
          favoriteTimestamps.push({
            date: item.addedAt, // Collect the addedAt date
          });
        }
      });
    });

    // Group the added timestamps by 10-minute intervals
    const groupFavorites = {};
    let currentCount = 0; // Keep track of the current favorite count

    favoriteTimestamps.forEach((favorite) => {
      const interval = Math.floor(
        new Date(favorite.date).getTime() / (10 * 60 * 1000)
      ); // Group by 10 minutes

      if (!groupFavorites[interval]) {
        groupFavorites[interval] = currentCount; // Initialize with the current favorite count
      }

      // Increment the count for each added favorite
      currentCount += 1;

      // Set the favorite count for this interval
      groupFavorites[interval] = currentCount;
    });

    // Prepare the response format
    const groupedData = Object.keys(groupFavorites).map((interval) => ({
      date: new Date(interval * 10 * 60 * 1000), // Convert interval back to date
      count: groupFavorites[interval],
    }));

    res.status(200).json({ favorites: groupedData });
  } catch (error) {
    console.error("Error fetching favorite counts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getItemFavoritesLastWeek = async (req, res) => {
  try {
    const { productId } = req.params;

    // Calculate the timestamp for 7 days ago
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Find all favorite records where the product was added in the last 7 days
    const favoriteRecords = await Favorite.find({
      "items.productId": productId,
      "items.addedAt": { $gte: oneWeekAgo },
    });

    if (!favoriteRecords || favoriteRecords.length === 0) {
      return res
        .status(404)
        .json({ error: "No recent favorite actions found for this item." });
    }

    const favoriteTimestamps = [];

    favoriteRecords.forEach((favorite) => {
      favorite.items.forEach((item) => {
        if (
          item.productId.toString() === productId &&
          item.addedAt >= oneWeekAgo
        ) {
          favoriteTimestamps.push({ date: item.addedAt });
        }
      });
    });

    const groupFavorites = {};
    let currentCount = 0;

    favoriteTimestamps.forEach((favorite) => {
      const interval = Math.floor(
        new Date(favorite.date).getTime() / (60 * 60 * 1000)
      ); // Group by 1 hour

      if (!groupFavorites[interval]) {
        groupFavorites[interval] = currentCount;
      }

      currentCount += 1;
      groupFavorites[interval] = currentCount;
    });

    const groupedData = Object.keys(groupFavorites).map((interval) => ({
      date: new Date(interval * 60 * 60 * 1000),
      count: groupFavorites[interval],
    }));

    res.status(200).json({ favorites: groupedData });
  } catch (error) {
    console.error("Error fetching favorite counts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getItemFavoritesLastMonth = async (req, res) => {
  try {
    const { productId } = req.params;

    // Calculate the timestamp for 30 days ago
    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);

    // Find all favorite records where the product was added in the last 30 days
    const favoriteRecords = await Favorite.find({
      "items.productId": productId,
      "items.addedAt": { $gte: oneMonthAgo },
    });

    if (!favoriteRecords || favoriteRecords.length === 0) {
      return res
        .status(404)
        .json({ error: "No recent favorite actions found for this item." });
    }

    const favoriteTimestamps = [];

    favoriteRecords.forEach((favorite) => {
      favorite.items.forEach((item) => {
        if (
          item.productId.toString() === productId &&
          item.addedAt >= oneMonthAgo
        ) {
          favoriteTimestamps.push({ date: item.addedAt });
        }
      });
    });

    const groupFavorites = {};
    let currentCount = 0;

    favoriteTimestamps.forEach((favorite) => {
      const interval = Math.floor(
        new Date(favorite.date).getTime() / (24 * 60 * 60 * 1000)
      ); // Group by 1 day

      if (!groupFavorites[interval]) {
        groupFavorites[interval] = currentCount;
      }

      currentCount += 1;
      groupFavorites[interval] = currentCount;
    });

    const groupedData = Object.keys(groupFavorites).map((interval) => ({
      date: new Date(interval * 24 * 60 * 60 * 1000),
      count: groupFavorites[interval],
    }));

    res.status(200).json({ favorites: groupedData });
  } catch (error) {
    console.error("Error fetching favorite counts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getItemFavoritesLastYear = async (req, res) => {
  try {
    const { productId } = req.params;

    // Calculate the timestamp for 365 days ago
    const oneYearAgo = new Date();
    oneYearAgo.setDate(oneYearAgo.getDate() - 365);

    // Find all favorite records where the product was added in the last 365 days
    const favoriteRecords = await Favorite.find({
      "items.productId": productId,
      "items.addedAt": { $gte: oneYearAgo },
    });

    if (!favoriteRecords || favoriteRecords.length === 0) {
      return res
        .status(404)
        .json({ error: "No recent favorite actions found for this item." });
    }

    const favoriteTimestamps = [];

    favoriteRecords.forEach((favorite) => {
      favorite.items.forEach((item) => {
        if (
          item.productId.toString() === productId &&
          item.addedAt >= oneYearAgo
        ) {
          favoriteTimestamps.push({ date: item.addedAt });
        }
      });
    });

    const groupFavorites = {};
    let currentCount = 0;

    favoriteTimestamps.forEach((favorite) => {
      const interval = Math.floor(
        new Date(favorite.date).getTime() / (7 * 24 * 60 * 60 * 1000)
      ); // Group by 1 week

      if (!groupFavorites[interval]) {
        groupFavorites[interval] = currentCount;
      }

      currentCount += 1;
      groupFavorites[interval] = currentCount;
    });

    const groupedData = Object.keys(groupFavorites).map((interval) => ({
      date: new Date(interval * 7 * 24 * 60 * 60 * 1000),
      count: groupFavorites[interval],
    }));

    res.status(200).json({ favorites: groupedData });
  } catch (error) {
    console.error("Error fetching favorite counts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getItemCartCountLastDay = async (req, res) => {
  try {
    const { productId } = req.params;

    // Calculate the timestamp for 24 hours ago
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    // Find all cart records where the product was added in the last 24 hours
    const cartRecords = await Cart.find({
      "items.productId": productId,
      "items.addedAt": { $gte: oneDayAgo },
    });

    // If no records are found
    if (!cartRecords || cartRecords.length === 0) {
      return res
        .status(404)
        .json({ error: "No recent cart actions found for this item." });
    }

    // Prepare an array to store the added timestamps of the item
    const cartTimestamps = [];

    // Iterate over each cart record and collect the timestamps
    cartRecords.forEach((cart) => {
      cart.items.forEach((item) => {
        if (
          item.productId.toString() === productId &&
          item.addedAt >= oneDayAgo
        ) {
          cartTimestamps.push({
            date: item.addedAt, // Collect the addedAt date
          });
        }
      });
    });

    // Group the added timestamps by 10-minute intervals
    const groupCarts = {};
    let currentCount = 0; // Keep track of the current cart count

    cartTimestamps.forEach((cart) => {
      const interval = Math.floor(
        new Date(cart.date).getTime() / (10 * 60 * 1000)
      ); // Group by 10 minutes

      if (!groupCarts[interval]) {
        groupCarts[interval] = currentCount; // Initialize with the current cart count
      }

      // Increment the count for each added cart
      currentCount += 1;

      // Set the cart count for this interval
      groupCarts[interval] = currentCount;
    });

    // Prepare the response format
    const groupedData = Object.keys(groupCarts).map((interval) => ({
      date: new Date(interval * 10 * 60 * 1000), // Convert interval back to date
      count: groupCarts[interval],
    }));

    res.status(200).json({ carts: groupedData });
  } catch (error) {
    console.error("Error fetching cart counts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getItemCartCountLastWeek = async (req, res) => {
  try {
    const { productId } = req.params;

    // Calculate the timestamp for 7 days ago
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const cartRecords = await Cart.find({
      "items.productId": productId,
      "items.addedAt": { $gte: oneWeekAgo },
    });

    if (!cartRecords || cartRecords.length === 0) {
      return res
        .status(404)
        .json({ error: "No recent cart actions found for this item." });
    }

    const cartTimestamps = [];

    cartRecords.forEach((cart) => {
      cart.items.forEach((item) => {
        if (
          item.productId.toString() === productId &&
          item.addedAt >= oneWeekAgo
        ) {
          cartTimestamps.push({ date: item.addedAt });
        }
      });
    });

    const groupCarts = {};
    let currentCount = 0;

    cartTimestamps.forEach((cart) => {
      const interval = Math.floor(
        new Date(cart.date).getTime() / (60 * 60 * 1000)
      ); // Group by 1 hour

      if (!groupCarts[interval]) {
        groupCarts[interval] = currentCount;
      }

      currentCount += 1;
      groupCarts[interval] = currentCount;
    });

    const groupedData = Object.keys(groupCarts).map((interval) => ({
      date: new Date(interval * 60 * 60 * 1000), // Convert interval back to date
      count: groupCarts[interval],
    }));

    res.status(200).json({ carts: groupedData });
  } catch (error) {
    console.error("Error fetching cart counts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getItemCartCountLastMonth = async (req, res) => {
  try {
    const { productId } = req.params;

    // Calculate the timestamp for 30 days ago
    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);

    const cartRecords = await Cart.find({
      "items.productId": productId,
      "items.addedAt": { $gte: oneMonthAgo },
    });

    if (!cartRecords || cartRecords.length === 0) {
      return res
        .status(404)
        .json({ error: "No recent cart actions found for this item." });
    }

    const cartTimestamps = [];

    cartRecords.forEach((cart) => {
      cart.items.forEach((item) => {
        if (
          item.productId.toString() === productId &&
          item.addedAt >= oneMonthAgo
        ) {
          cartTimestamps.push({ date: item.addedAt });
        }
      });
    });

    const groupCarts = {};
    let currentCount = 0;

    cartTimestamps.forEach((cart) => {
      const interval = Math.floor(
        new Date(cart.date).getTime() / (24 * 60 * 60 * 1000)
      ); // Group by 1 day

      if (!groupCarts[interval]) {
        groupCarts[interval] = currentCount;
      }

      currentCount += 1;
      groupCarts[interval] = currentCount;
    });

    const groupedData = Object.keys(groupCarts).map((interval) => ({
      date: new Date(interval * 24 * 60 * 60 * 1000), // Convert interval back to date
      count: groupCarts[interval],
    }));

    res.status(200).json({ carts: groupedData });
  } catch (error) {
    console.error("Error fetching cart counts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getItemCartCountLastYear = async (req, res) => {
  try {
    const { productId } = req.params;

    // Calculate the timestamp for 365 days ago
    const oneYearAgo = new Date();
    oneYearAgo.setDate(oneYearAgo.getDate() - 365);

    const cartRecords = await Cart.find({
      "items.productId": productId,
      "items.addedAt": { $gte: oneYearAgo },
    });

    if (!cartRecords || cartRecords.length === 0) {
      return res
        .status(404)
        .json({ error: "No recent cart actions found for this item." });
    }

    const cartTtimestamps = [];

    cartRecords.forEach((cart) => {
      cart.items.forEach((item) => {
        if (
          item.productId.toString() === productId &&
          item.addedAt >= oneYearAgo
        ) {
          cartTtimestamps.push({ date: item.addedAt });
        }
      });
    });

    const groupCarts = {};
    let currentCount = 0;

    cartTtimestamps.forEach((cart) => {
      const interval = Math.floor(
        new Date(cart.date).getTime() / (7 * 24 * 60 * 60 * 1000)
      ); // Group by 1 week

      if (!groupCarts[interval]) {
        groupCarts[interval] = currentCount;
      }

      currentCount += 1;
      groupCarts[interval] = currentCount;
    });

    const groupedData = Object.keys(groupCarts).map((interval) => ({
      date: new Date(interval * 7 * 24 * 60 * 60 * 1000), // Convert interval back to date
      count: groupCarts[interval],
    }));

    res.status(200).json({ carts: groupedData });
  } catch (error) {
    console.error("Error fetching cart counts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const submitOrder = async (req, res) => {
  try {
    const { buyer, items, totalPrice, userLocation } = req.body;

    // Validate if items and other fields are present
    if (
      !buyer ||
      !items ||
      items.length === 0 ||
      !totalPrice ||
      !userLocation
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Create the new order document
    const newOrder = new Order({
      buyer,
      items,
      totalPrice,
      userLocation,
      createdAt: Date.now(),
    });

    // Save the order to the database
    await newOrder.save();

    // Update salesCount and salesHistory for each item in the order
    const itemUpdates = items.map(async (item) => {
      return ItemModel.findByIdAndUpdate(
        item.productId,
        {
          $inc: { salesCount: item.quantity }, // Increment total sales count by quantity
          $push: {
            salesHistory: {
              date: new Date(), // Date of the sale
              quantity: item.quantity, // Quantity sold
            },
          },
        },
        { new: true }
      );
    });

    // Wait for all item updates to complete
    await Promise.all(itemUpdates);

    // Clear the cart for the user
    await Cart.findOneAndUpdate(
      { userId: buyer },
      { items: [] } // Set items array to an empty array to clear the cart
    );

    res.status(201).json({
      message:
        "Order submitted successfully, cart cleared, and item sales updated",
      order: newOrder,
    });
  } catch (error) {
    console.error("Error submitting order:", error);
    res.status(500).json({ message: "Error submitting order", error });
  }
};

const getOrdersForSeller = async (req, res) => {
  const { sellerId } = req.query;

  try {
    // Find orders where any of the items have the seller matching the sellerId and filter out the relevant items at the DB level
    const orders = await Order.find({
      "items.seller": sellerId, // Filter based on seller in items
    })
      .populate({
        path: "items.productId", // Populate the product details
        select: "name price image1", // Select only the fields you need
      })
      .lean(); // Use lean to get plain JS objects instead of Mongoose documents for performance.

    // Filter out only the relevant items for this seller in each order
    const filteredOrders = orders.map((order) => {
      const filteredItems = order.items.filter(
        (item) => String(item.seller) === String(sellerId)
      );
      return {
        ...order,
        items: filteredItems,
      };
    });

    res.status(200).json({ orders: filteredOrders });
  } catch (error) {
    console.error("Error fetching seller's orders:", error);
    res.status(500).json({ message: "Error fetching orders", error });
  }
};

const getOrdersForBuyer = async (req, res) => {
  const { buyerId } = req.query;

  try {
    // Find all orders for the buyer
    const orders = await Order.find({
      buyer: buyerId, // Filter by buyer ID
    })
      .populate({
        path: "items.productId", // Populate product details
        select: "name price image1 salesCount salesHistory", // Include salesCount and salesHistory
      })
      .lean(); // Return plain JS objects for performance

    res.status(200).json({ orders });
  } catch (error) {
    console.error("Error fetching buyer's orders:", error);
    res.status(500).json({ message: "Error fetching orders", error });
  }
};

const updateItemStatus = async (req, res) => {
  const { orderId, itemId } = req.params;
  const { status } = req.body;

  try {
    // Find the order that contains the item with the provided itemId
    const order = await Order.findOneAndUpdate(
      { _id: orderId, "items.productId": itemId }, // Ensure the order contains the correct item
      { $set: { "items.$.status": status } }, // Use $ to update only the matched item
      { new: true } // Return the updated document
    );

    if (!order) {
      return res.status(404).json({ message: "Order or item not found." });
    }

    res
      .status(200)
      .json({ message: "Item status updated successfully", order });
  } catch (error) {
    console.error("Error updating item status:", error);
    res.status(500).json({ message: "Error updating item status", error });
  }
};

const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User with this email does not exist." });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Set token and expiration time
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now

    await user.save();

    // Generate the reset URL
    const resetUrl = `http://localhost:5173/ethereal/reset-password/${resetToken}`;

    // Configure SendGrid email content
    const msg = {
      to: user.email, // Recipient's email
      from: process.env.SENDGRID_FROM_EMAIL, // Verified sender email
      subject: "Password Reset Request",
      html: `
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetUrl}" target="_blank">Reset your password</a>
        <p>If you didn't request this, you can ignore this email.</p>
      `,
    };

    // Send the email
    try {
      await sgMail.send(msg);
      console.log("Password reset email sent successfully");
      res
        .status(200)
        .json({ message: "Password reset link sent to your email." });
    } catch (emailError) {
      console.error("Error sending password reset email:", emailError);
      res.status(500).json({ message: "Error sending password reset email." });
    }
  } catch (error) {
    console.error("Error processing password reset request:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const verifyResetToken = async (req, res) => {
  const { token } = req.params;

  try {
    const user = await UserModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // Token is valid only if not expired
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token." });
    }

    res.status(200).json({ message: "Token is valid." });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    // Find the user by reset token and ensure the token is not expired
    const user = await UserModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // Check token expiration
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token." });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the password and clear reset token fields
    await UserModel.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined,
    });

    // Generate the login URL
    const try_loginUrl = `http://localhost:5173/ethereal/login`;

    // Configure SendGrid email
    const msg = {
      to: user.email, // Recipient's email
      from: process.env.SENDGRID_FROM_EMAIL, // Verified sender email
      subject: "Password Reset Successfully",
      html: `
        <p>You have successfully reset your password.</p>
        <a href="${try_loginUrl}" target="_blank">Try to login now</a>
        <p>Make sure you save your password somewhere safe.</p>
      `,
    };

    // Send the email
    try {
      await sgMail.send(msg);
      console.log("Password reset confirmation email sent successfully.");
      return res.status(200).json({
        message: "Password reset successfully. Confirmation email sent.",
      });
    } catch (emailError) {
      console.error("Error sending confirmation email:", emailError);
      return res.status(500).json({ message: "Error sending email." });
    }
  } catch (error) {
    console.error("Error during password reset:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const searchSuggestions = async (req, res) => {
  const searchQuery = req.query.query;

  if (!searchQuery) {
    return res.status(400).json({ error: "Search query is required" });
  }

  try {
    // Search by 'name' field only
    const suggestions = await ItemModel.find({
      name: { $regex: searchQuery, $options: "i" }, // Case-insensitive match on the name field
    })
      .limit(10) // Limit the results to 10 suggestions
      .select("name"); // Select only the 'name' field

    // Format suggestions as an array of names
    const formattedSuggestions = suggestions.map((item) => item.name);

    res.json(formattedSuggestions);
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const clearCart = async (req, res) => {
  try {
    const buyer = req.buyer;

    // Find the user's cart and remove all items
    await Cart.findOneAndUpdate(
      { userId: buyer },
      { items: [] } // Set items array to an empty array to clear the cart
    );

    res.status(200).json({ message: "Cart cleared successfully" });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ message: "Error clearing cart", error });
  }
};

const updateSalesCount = async (req, res) => {
  try {
    const { items } = req.body;

    // Update sales count for each item
    for (const item of items) {
      await ItemModel.findByIdAndUpdate(item.productId, {
        $inc: { salesCount: item.quantity }, // Increment sales count
        salesDate: new Date(), // Update the last sales date
      });
    }

    // Create the order in the database
    const newOrder = await Order.create(req.body);

    res.status(201).json({ success: true, order: newOrder });
  } catch (error) {
    console.error("Error submitting order:", error);
    res.status(500).json({ error: "Failed to submit order" });
  }
};

// const getItemsTotalSalesLastDay = async (req, res) => {
//   try {
//     const { itemId } = req.params;

//     // Calculate the time for 24 hours ago
//     const oneDayAgo = new Date();
//     oneDayAgo.setDate(oneDayAgo.getDate() - 1);

//     // Retrieve the item and filter sales within the last 24 hours
//     const item = await ItemModel.findById(itemId);

//     if (!item) {
//       return res.status(404).json({ error: "Item not found" });
//     }

//     // Filter sales from the last 24 hours
//     const salesLastDay = item.salesHistory.filter(
//       (sale) => new Date(sale.date) >= oneDayAgo
//     );

//     // Group sales by 10-minute intervals
//     const groupedSales = {};
//     salesLastDay.forEach((sale) => {
//       const interval = Math.floor(
//         new Date(sale.date).getTime() / (10 * 60 * 1000)
//       ); // Group by 10-minute intervals
//       if (!groupedSales[interval]) {
//         groupedSales[interval] = 0;
//       }
//       groupedSales[interval] += sale.quantity;
//     });

//     // Prepare the response format with formatted dates
//     const groupedData = Object.keys(groupedSales).map((interval) => ({
//       date: new Date(interval * 10 * 60 * 1000), // Convert interval back to date
//       count: groupedSales[interval],
//     }));

//     res.status(200).json({ sales: groupedData });
//   } catch (error) {
//     console.error("Error fetching sales data:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

const getItemsTotalSalesByPeriod = async (req, res) => {
  try {
    const { itemId, filterDate } = req.params;

    // Calculate the start date based on the filterDate
    const now = new Date();
    let startDate;

    switch (filterDate) {
      case "Day":
        startDate = new Date(now.setDate(now.getDate() - 1)); // Last 24 hours
        break;
      case "Week":
        startDate = new Date(now.setDate(now.getDate() - 7)); // Last 7 days
        break;
      case "Month":
        startDate = new Date(now.setMonth(now.getMonth() - 1)); // Last 30 days
        break;
      case "Year":
        startDate = new Date(now.setFullYear(now.getFullYear() - 1)); // Last year
        break;
      default:
        return res.status(400).json({ error: "Invalid filter date" });
    }

    // Retrieve the item and filter sales within the specified period
    const item = await ItemModel.findById(itemId);

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    // Filter sales within the calculated time period
    const salesInPeriod = item.salesHistory.filter(
      (sale) => new Date(sale.date) >= startDate
    );

    // Define interval in milliseconds based on filterDate
    let intervalMs;
    if (filterDate === "Day") {
      intervalMs = 10 * 60 * 1000; // 10 minutes for last day
    } else if (filterDate === "Week") {
      intervalMs = 60 * 60 * 1000; // 1 hour for last week
    } else if (filterDate === "Month") {
      intervalMs = 24 * 60 * 60 * 1000; // 1 day for last month
    } else if (filterDate === "Year") {
      intervalMs = 7 * 24 * 60 * 60 * 1000; // 1 week for last year
    }

    // Group sales by the specified interval
    const groupedSales = {};
    salesInPeriod.forEach((sale) => {
      const interval = Math.floor(new Date(sale.date).getTime() / intervalMs);
      if (!groupedSales[interval]) {
        groupedSales[interval] = 0;
      }
      groupedSales[interval] += sale.quantity;
    });

    // Prepare the response format with formatted dates
    const groupedData = Object.keys(groupedSales).map((interval) => ({
      date: new Date(interval * intervalMs), // Convert interval back to date
      count: groupedSales[interval],
    }));

    res.status(200).json({ sales: groupedData });
  } catch (error) {
    console.error("Error fetching sales data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const signOut = async (req, res) => {
  // Clear the JWT cookie
  res.clearCookie("cookie", {
    httpOnly: true,
  });

  // Send response to confirm sign out
  res.status(200).json({ message: "Signed out successfully" });
};

module.exports = {
  createItem,
  getItems,
  createUser,
  checkUserToken,
  userLogin,
  getCategoryItems,
  getProduct,
  addToCart,
  getCartItems,
  deleteCartItem,
  addToFavorite,
  getFavoriteItems,
  deleteFavoriteItem,
  getUserDetails,
  updateUserDetails,
  checkNameCombination,
  updateUserEmail,
  checkEmailUnique,
  verifyPassword,
  updatePassword,
  itemQuantityUpdate,
  itemSizeUpdate,
  yourItems,
  editYourItem,
  getYourItemToEdit,
  deleteYourItem,
  incrementView,
  getViewsLastDay,
  getViewsLastWeek,
  getViewsLastMonth,
  getViewsLastYear,
  getItemFavoritesLastDay,
  getItemFavoritesLastWeek,
  getItemFavoritesLastMonth,
  getItemFavoritesLastYear,
  getItemCartCountLastDay,
  getItemCartCountLastWeek,
  getItemCartCountLastMonth,
  getItemCartCountLastYear,
  submitOrder,
  getOrdersForSeller,
  getOrdersForBuyer,
  updateItemStatus,
  requestPasswordReset,
  verifyResetToken,
  resetPassword,
  searchSuggestions,
  clearCart,
  updateSalesCount,
  // getItemsTotalSalesLastDay,
  getItemsTotalSalesByPeriod,
  signOut,
  activateAccount,
};
