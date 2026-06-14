const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category classification is required"],
    },
    moq: {
      type: Number,
      required: [true, "Minimum Order Quantity (MOQ) is required"],
      min: [1, "MOQ must be at least 1 unit"],
    },
    tiers: [
      {
        qty: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    images: {
      type: [String],
      required: [true, "At least one product image is required"],
    },
    materialType: {
      type: String,
      required: [true, "Material composition type is required"],
      trim: true,
    },
    availableColors: {
      type: [String],
      default: ["Standard"],
    },
    stock: {
      type: Number,
      required: [true, "Stock availability count is required"],
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", ProductSchema);
