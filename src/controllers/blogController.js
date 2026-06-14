const Blog = require("../models/Blog");

// Helper to generate a slug from title
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};

// @desc    Get all blogs
// @route   GET /api/v1/blogs
// @access  Public
exports.getBlogs = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    
    // Non-admin can only see published blogs
    if (!req.user || req.user.role !== "admin") {
      filter.status = "published";
    } else if (status) {
      filter.status = status;
    }

    const blogs = await Blog.find(filter)
      .populate("author", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: blogs.length,
      data: blogs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single blog by slug or ID
// @route   GET /api/v1/blogs/:idOrSlug
// @access  Public
exports.getBlog = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    let blog;

    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      blog = await Blog.findById(idOrSlug).populate("author", "name email");
    } else {
      blog = await Blog.findOne({ slug: idOrSlug }).populate("author", "name email");
    }

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    res.status(200).json({
      success: true,
      data: blog,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new blog
// @route   POST /api/v1/blogs
// @access  Private/Admin
exports.createBlog = async (req, res, next) => {
  try {
    const { title, excerpt, content, coverImage, category, tags, readTime, status, seo } = req.body;

    const slug = generateSlug(title);

    // Check slug uniqueness
    const slugExists = await Blog.findOne({ slug });
    if (slugExists) {
      return res.status(400).json({
        success: false,
        message: "A blog post with a similar title already exists. Please choose a different title.",
      });
    }

    const blog = await Blog.create({
      title,
      slug,
      excerpt,
      content,
      coverImage: coverImage || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=800",
      category,
      tags: tags || [],
      readTime: readTime || "5 min read",
      status: status || "draft",
      seo: seo || {},
      author: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: blog,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update blog
// @route   PUT /api/v1/blogs/:id
// @access  Private/Admin
exports.updateBlog = async (req, res, next) => {
  try {
    let blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    const updates = { ...req.body };
    if (updates.title && updates.title !== blog.title) {
      updates.slug = generateSlug(updates.title);
      // Verify new slug uniqueness
      const slugExists = await Blog.findOne({ slug: updates.slug, _id: { $ne: req.params.id } });
      if (slugExists) {
        return res.status(400).json({
          success: false,
          message: "A blog post with a similar title already exists. Please choose a different title.",
        });
      }
    }

    blog = await Blog.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: blog,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete blog
// @route   DELETE /api/v1/blogs/:id
// @access  Private/Admin
exports.deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    await blog.deleteOne();

    res.status(200).json({
      success: true,
      message: "Blog post deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
