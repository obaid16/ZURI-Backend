const express = require("express");
const router = express.Router();
const {
  getProducts,
  getFeaturedProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const { protect, admin } = require("../middleware/auth");
const { validateProduct } = require("../middleware/validator");
const upload = require("../middleware/upload");

router.get("/", getProducts);
router.get("/featured", getFeaturedProducts);
router.get("/:id", getProductById);

// Admin-only product management (with multiple images upload middleware)
router.post("/", protect, admin, upload.array("images", 5), validateProduct, createProduct);
router.put("/:id", protect, admin, upload.array("images", 5), updateProduct);
router.delete("/:id", protect, admin, deleteProduct);

module.exports = router;
