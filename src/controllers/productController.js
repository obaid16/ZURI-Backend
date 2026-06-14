const Product = require("../models/Product");
const Category = require("../models/Category");
const mongoose = require("mongoose");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

// Helper function to upload files to Cloudinary with local storage fallback
const uploadFile = async (file) => {
  try {
    // Check if Cloudinary parameters are mock/default
    if (
      !process.env.CLOUDINARY_API_KEY ||
      process.env.CLOUDINARY_API_KEY === "mock_key"
    ) {
      throw new Error("Using local storage fallback.");
    }

    const res = await cloudinary.uploader.upload(file.path, {
      folder: "zuri_enterprises_catalog",
    });

    // Remove local buffered file
    try {
      fs.unlinkSync(file.path);
    } catch (e) {}

    return res.secure_url;
  } catch (error) {
    console.log(`Media Upload Fallback: ${error.message}`);
    // Fall back to local URL path
    return `/uploads/${file.filename}`;
  }
};

// @desc    Get all products (with filters, search, pagination, and sorting)
// @route   GET /api/v1/products
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    const { category, search, sort, page = 1, limit = 9 } = req.query;

    const queryObj = {};

    // 1. Category filter
    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        queryObj.category = category;
      } else {
        const foundCat = await Category.findOne({ slug: category });
        if (foundCat) {
          queryObj.category = foundCat._id;
        } else {
          queryObj.category = new mongoose.Types.ObjectId();
        }
      }
    }

    // 2. Search keyword
    if (search) {
      queryObj.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { materialType: { $regex: search, $options: "i" } },
      ];
    }

    let query = Product.find(queryObj).populate("category");

    // 3. Sorting
    if (sort) {
      if (sort === "price-asc") {
        query = query.sort({ "tiers.price": 1 }); // Sort by tier baseline ascending
      } else if (sort === "price-desc") {
        query = query.sort({ "tiers.price": -1 });
      } else if (sort === "moq") {
        query = query.sort({ moq: 1 });
      } else {
        query = query.sort({ createdAt: -1 }); // Default recent
      }
    } else {
      query = query.sort({ createdAt: -1 });
    }

    // 4. Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    query = query.skip(skip).limit(limitNum);

    const products = await query;
    const total = await Product.countDocuments(queryObj);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured products
// @route   GET /api/v1/products/featured
// @access  Public
exports.getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ featured: true }).populate("category").limit(5);
    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID
// @route   GET /api/v1/products/:id
// @access  Public
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }
    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new product
// @route   POST /api/v1/products
// @access  Private/Admin
exports.createProduct = async (req, res, next) => {
  try {
    // Process multiple file uploads if present
    const images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadFile(file);
        images.push(url);
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Please upload at least one product image.",
      });
    }

    // Parse tiers if sent as JSON string
    let parsedTiers = req.body.tiers;
    if (typeof parsedTiers === "string") {
      parsedTiers = JSON.parse(parsedTiers);
    }

    // Parse availableColors if sent as JSON string
    let parsedColors = req.body.availableColors;
    if (typeof parsedColors === "string") {
      parsedColors = JSON.parse(parsedColors);
    }

    const productData = {
      ...req.body,
      images,
      tiers: parsedTiers,
      availableColors: parsedColors,
    };

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing product
// @route   PUT /api/v1/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // Append new uploaded images if files are provided
    let images = [...product.images];
    if (req.files && req.files.length > 0) {
      const newImages = [];
      for (const file of req.files) {
        const url = await uploadFile(file);
        newImages.push(url);
      }
      images = newImages; // replace or append depending on B2B rules (we replace/update standard array)
    }

    let parsedTiers = req.body.tiers || product.tiers;
    if (typeof parsedTiers === "string") {
      parsedTiers = JSON.parse(parsedTiers);
    }

    let parsedColors = req.body.availableColors || product.availableColors;
    if (typeof parsedColors === "string") {
      parsedColors = JSON.parse(parsedColors);
    }

    const updateData = {
      ...req.body,
      images,
      tiers: parsedTiers,
      availableColors: parsedColors,
    };

    product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product
// @route   DELETE /api/v1/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: "Product deleted from catalog successfully.",
    });
  } catch (error) {
    next(error);
  }
};
