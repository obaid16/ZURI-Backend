const express = require("express");
const router = express.Router();
const {
  createInquiry,
  getInquiries,
  getInquiryById,
  updateInquiryStatus,
} = require("../controllers/inquiryController");
const { protect, admin } = require("../middleware/auth");
const { validateInquiry } = require("../middleware/validator");
const upload = require("../middleware/upload");

// Public submit inquiry (supports uploading up to 3 attachments)
router.post("/", upload.array("attachments", 3), validateInquiry, createInquiry);

// Protected inquiry tracking
router.get("/", protect, admin, getInquiries);
router.get("/:id", protect, getInquiryById);
router.put("/:id/status", protect, admin, updateInquiryStatus);

module.exports = router;
