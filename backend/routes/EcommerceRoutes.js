const experess = require("express");
const router = experess.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const {
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
} = require("../controllers/EcommerceCTRL");

// Configure storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Use /tmp directory on Vercel (for serverless environments)
    const uploadDir = '/tmp/uploads';

    // Ensure the directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir); // Directory where files will be stored
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Limit to 10 MB per file
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/jpg"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Invalid file type, only JPEG, PNG, or GIF allowed"), false);
    }
    cb(null, true);
  },
});

// Define route to handle file uploads
router.post(
  "/upload-item",
  checkUserToken,
  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
    { name: "image5", maxCount: 1 },
  ]),
  createItem
);

// router.post("/upload-item", checkUserToken, uploadItem);

router.get("/", getItems);
// adding an image route

router.get("/");

router.get("/validate-user", checkUserToken, (req, res) => {
  res.status(200).json({ valid: true }); // User is authenticated, return `valid: true`
});
router.post("/signup", createUser);
router.get("/activate-account", activateAccount);
router.post("/login", userLogin);
router.get("/categories/:category", getCategoryItems);
router.get("/categories/:category/:id", getProduct);
router.post("/cart/add", checkUserToken, addToCart);
router.get("/cart", checkUserToken, getCartItems);
router.delete("/cart/delete/:productId", checkUserToken, deleteCartItem);
router.post("/favorites/add", checkUserToken, addToFavorite);
router.get("/favorites/get", checkUserToken, getFavoriteItems);
router.post("/favorites/remove", checkUserToken, deleteFavoriteItem);
router.get("/user-details", checkUserToken, getUserDetails);
router.post("/updateUserDetails", checkUserToken, updateUserDetails);
router.post("/checkNameCombination", checkUserToken, checkNameCombination);
router.post("/updateUserEmail", checkUserToken, updateUserEmail);
router.post("/checkEmailUnique", checkUserToken, checkEmailUnique);
router.post("/verify-password", checkUserToken, verifyPassword);
router.post("/update-password", checkUserToken, updatePassword);
router.put("/cart/itemQuantityUpdate", checkUserToken, itemQuantityUpdate);
router.put("/cart/itemSizeUpdate", checkUserToken, itemSizeUpdate);
router.get("/yourItems/get", checkUserToken, yourItems);
router.get("/getYourItemToEdit/:id", checkUserToken, getYourItemToEdit);
router.put("/editYourItem/:id", checkUserToken, editYourItem);
router.delete("/yourItem/delete/:productId", checkUserToken, deleteYourItem);
router.patch("/increment-views/:productId", incrementView);
router.get("/getItemViewsLastDay/:itemId", checkUserToken, getViewsLastDay);
router.get("/getItemViewsLastWeek/:itemId", checkUserToken, getViewsLastWeek);
router.get("/getItemViewsLastMonth/:itemId", checkUserToken, getViewsLastMonth);
router.get("/getItemViewsLastYear/:itemId", checkUserToken, getViewsLastYear);
router.get(
  "/getItemFavoritesLastDay/:productId",
  checkUserToken,
  getItemFavoritesLastDay
);
router.get(
  "/getItemFavoritesLastWeek/:productId",
  checkUserToken,
  getItemFavoritesLastWeek
);
router.get(
  "/getItemFavoritesLastMonth/:productId",
  checkUserToken,
  getItemFavoritesLastMonth
);
router.get(
  "/getItemFavoritesLastYear/:productId",
  checkUserToken,
  getItemFavoritesLastYear
);
router.get(
  "/getItemCartCountLastDay/:productId",
  checkUserToken,
  getItemCartCountLastDay
);
router.get(
  "/getItemCartCountLastWeek/:productId",
  checkUserToken,
  getItemCartCountLastWeek
);
router.get(
  "/getItemCartCountLastMonth/:productId",
  checkUserToken,
  getItemCartCountLastMonth
);
router.get(
  "/getItemCartCountLastYear/:productId",
  checkUserToken,
  getItemCartCountLastYear
);
// router.get(
//   "/getItemsTotalSalesDay/:itemId",
//   checkUserToken,
//   getItemsTotalSalesLastDay
// );
router.get(
  "/getItemsTotalSalesByPeriod/:filterDate/:itemId",
  checkUserToken,
  getItemsTotalSalesByPeriod
);
router.post("/submitOrder", checkUserToken, submitOrder);
router.get("/orders", checkUserToken, getOrdersForSeller);
router.get("/ordersBuyer", checkUserToken, getOrdersForBuyer);
router.patch(
  "/orders/:orderId/items/:itemId/updateStatus",
  checkUserToken,
  updateItemStatus
);

router.post("/request-password-reset", requestPasswordReset);
router.post("/reset-password/:token", resetPassword);
router.get("/suggestions", searchSuggestions);
router.delete("/clear", checkUserToken, clearCart);
router.patch("/update/salesCount", checkUserToken, updateSalesCount);
router.get("/auth/signout", signOut);
module.exports = router;
