const express = require("express");
const router = express.Router();
const { register, login, getMe, getUsers, updateUser, deleteUser } = require("../controllers/authController");
const { protect, admin } = require("../middleware/auth");
const { validateRegister, validateLogin } = require("../middleware/validator");

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.get("/me", protect, getMe);

// Admin-only user management routes
router.get("/users", protect, admin, getUsers);
router.route("/users/:id")
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

module.exports = router;
