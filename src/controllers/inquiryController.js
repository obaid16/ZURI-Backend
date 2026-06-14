const Inquiry = require("../models/Inquiry");
const Product = require("../models/Product");
const sendEmail = require("../utils/email");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

// Helper function to upload files with local storage fallback
const uploadFile = async (file) => {
  try {
    if (
      !process.env.CLOUDINARY_API_KEY ||
      process.env.CLOUDINARY_API_KEY === "mock_key"
    ) {
      throw new Error("Using local storage fallback.");
    }
    const res = await cloudinary.uploader.upload(file.path, {
      folder: "zuri_enterprises_inquiries",
    });
    try {
      fs.unlinkSync(file.path);
    } catch (e) {}
    return res.secure_url;
  } catch (error) {
    console.log(`Attachment Upload Fallback: ${error.message}`);
    return `/uploads/${file.filename}`;
  }
};

// @desc    Submit a new bulk inquiry
// @route   POST /api/v1/inquiries
// @access  Public
exports.createInquiry = async (req, res, next) => {
  try {
    // Process attachments
    const attachments = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadFile(file);
        attachments.push(url);
      }
    }

    // Parse items array from JSON string if sent as multi-part form data
    let items = req.body.items;
    if (typeof items === "string") {
      items = JSON.parse(items);
    }

    const { name, company, email, phone, details } = req.body;

    const inquiryData = {
      user: req.user ? req.user._id : undefined,
      name,
      company,
      email,
      phone,
      details,
      items,
      attachments,
    };

    const inquiry = await Inquiry.create(inquiryData);

    // Calculate estimated total and compile lines for notification email
    let itemsHtmlList = "";
    let estimatedGrossTotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.product);
      const productName = product ? product.name : "Custom Item";
      const totalLinePrice = item.quantity * item.price;
      estimatedGrossTotal += totalLinePrice;
      
      itemsHtmlList += `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${productName}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.color}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">$${item.price.toFixed(2)}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right; font-weight: bold;">$${totalLinePrice.toFixed(2)}</td>
        </tr>
      `;
    }

    // Format HTML email for administrator
    const adminEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; color: #333; line-height: 1.6;">
        <h2 style="color: #c5a85b; border-bottom: 2px solid #c5a85b; padding-bottom: 8px; text-transform: uppercase;">
          New Bulk Sourcing Inquiry Received
        </h2>
        <p>A new B2B quotation request has been logged. Details below:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="width: 140px; font-weight: bold; padding: 4px 0;">Client Name:</td>
            <td>${name}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; padding: 4px 0;">Company:</td>
            <td>${company}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; padding: 4px 0;">Email:</td>
            <td><a href="mailto:${email}">${email}</a></td>
          </tr>
          <tr>
            <td style="font-weight: bold; padding: 4px 0;">Phone:</td>
            <td>${phone}</td>
          </tr>
        </table>

        <h3 style="color: #0a0e17; margin-top: 25px;">Sourcing Requirements:</h3>
        <p style="background: #f9f9f9; padding: 12px; border-left: 4px solid #c5a85b; font-style: italic;">
          ${details}
        </p>

        <h3 style="color: #0a0e17; margin-top: 25px;">Requested Items List:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #0a0e17; color: white;">
              <th style="padding: 8px; text-align: left;">Style Name</th>
              <th style="padding: 8px; text-align: center;">Color</th>
              <th style="padding: 8px; text-align: center;">Qty</th>
              <th style="padding: 8px; text-align: right;">Unit Rate</th>
              <th style="padding: 8px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtmlList}
          </tbody>
        </table>

        <div style="text-align: right; margin-top: 15px; font-size: 16px;">
          <strong>Estimated Sourcing Value:</strong> 
          <span style="color: #a88a38; font-size: 18px; font-weight: bold;">$${estimatedGrossTotal.toFixed(2)}</span>
        </div>

        <p style="margin-top: 30px; font-size: 11px; color: #888; border-top: 1px solid #eee; padding-top: 10px;">
          Zuri Enterprises Procurement Portal • Auto-mailer Notification.
        </p>
      </div>
    `;

    // Notify administrator (auto-sends to admin account defined in env)
    await sendEmail({
      email: process.env.EMAIL_FROM || "admin@zurienterprises.com",
      subject: `[NEW INQUIRY] Sourcing Request from ${company}`,
      message: `New bulk sourcing ticket logged by ${name} from ${company}. Sourcing total: $${estimatedGrossTotal.toFixed(2)}`,
      html: adminEmailHtml,
    });

    res.status(201).json({
      success: true,
      message: "Procurement inquiry ticket successfully logged. Notifications dispatched.",
      inquiry,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all inquiries
// @route   GET /api/v1/inquiries
// @access  Private/Admin
exports.getInquiries = async (req, res, next) => {
  try {
    const inquiries = await Inquiry.find()
      .populate("items.product")
      .populate("user", "name email company")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: inquiries.length,
      inquiries,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single inquiry details
// @route   GET /api/v1/inquiries/:id
// @access  Private
exports.getInquiryById = async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id)
      .populate("items.product")
      .populate("user", "name email company");

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry ticket not found.",
      });
    }

    // Protect check: Only Admins or the User who created the inquiry can view it
    if (
      req.user.role !== "admin" &&
      inquiry.user &&
      inquiry.user._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Access forbidden. Sourcing ticket belongs to another B2B profile.",
      });
    }

    res.status(200).json({
      success: true,
      inquiry,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update inquiry status
// @route   PUT /api/v1/inquiries/:id/status
// @access  Private/Admin
exports.updateInquiryStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status || !["pending", "reviewed", "completed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid status coordinate ('pending', 'reviewed', 'completed').",
      });
    }

    let inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found.",
      });
    }

    inquiry.status = status;
    await inquiry.save();

    res.status(200).json({
      success: true,
      message: `Inquiry ticket updated to ${status}.`,
      inquiry,
    });
  } catch (error) {
    next(error);
  }
};
