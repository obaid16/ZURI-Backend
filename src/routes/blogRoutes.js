const express = require("express");
const router = express.Router();
const {
  getBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog,
} = require("../controllers/blogController");
const { protect, admin } = require("../middleware/auth");

// Optionally check if token is present for getBlogs/getBlog so admins can see drafts
const checkUserOptional = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer")) {
    return protect(req, res, next);
  }
  next();
};

router.route("/")
  .get(checkUserOptional, getBlogs)
  .post(protect, admin, createBlog);

router.route("/:idOrSlug")
  .get(checkUserOptional, getBlog);

router.route("/:id")
  .put(protect, admin, updateBlog)
  .delete(protect, admin, deleteBlog);

module.exports = router;
