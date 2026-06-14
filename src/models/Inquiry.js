const mongoose = require("mongoose");

const InquirySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // User can be guest or logged-in
    },
    name: {
      type: String,
      required: [true, "Inquirer name is required"],
      trim: true,
    },
    company: {
      type: String,
      required: [true, "Company entity name is required for inquiries"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Contact email is required"],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, "Contact phone is required"],
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: [true, "Product reference is required in inquiry line"],
        },
        color: {
          type: String,
          default: "Standard",
        },
        quantity: {
          type: Number,
          required: [true, "Quantity is required"],
          min: [1, "Quantity must be at least 1"],
        },
        price: {
          type: Number,
          required: [true, "Price rate is required"],
        },
      },
    ],
    details: {
      type: String,
      required: [true, "Please provide procurement/customization details"],
    },
    attachments: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "completed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Inquiry", InquirySchema);
