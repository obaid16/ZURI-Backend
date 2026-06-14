const express = require("express");
const router = express.Router();
const { getAnalytics, getNotifications } = require("../controllers/dashboardController");
const { protect, admin } = require("../middleware/auth");

router.get("/analytics", protect, admin, getAnalytics);
router.get("/notifications", protect, admin, getNotifications);

module.exports = router;

