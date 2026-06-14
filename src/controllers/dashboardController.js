const Product = require("../models/Product");
const Inquiry = require("../models/Inquiry");
const User = require("../models/User");
const Blog = require("../models/Blog");

// @desc    Get Admin dashboard analytics summary metrics
// @route   GET /api/v1/dashboard/analytics
// @access  Private/Admin
exports.getAnalytics = async (req, res, next) => {
  try {
    // 1. User analytics count
    const totalUsers = await User.countDocuments({ role: "user" });

    // 2. Product analytics counts
    const totalProducts = await Product.countDocuments();
    const featuredProductsCount = await Product.countDocuments({ featured: true });

    // 3. Inquiry status counts
    const totalInquiries = await Inquiry.countDocuments();
    const pendingInquiries = await Inquiry.countDocuments({ status: "pending" });
    const reviewedInquiries = await Inquiry.countDocuments({ status: "reviewed" });
    const completedInquiries = await Inquiry.countDocuments({ status: "completed" });

    // 4. Recent inquiries list
    const recentInquiries = await Inquiry.find()
      .populate("user", "name company")
      .select("name company email status createdAt items")
      .sort({ createdAt: -1 })
      .limit(5);

    // 5. Estimated Sales Contract Valuations (completed / reviewed inquiries sum values)
    const allInquiries = await Inquiry.find({ status: { $in: ["reviewed", "completed"] } });
    let totalEstimatedB2BSales = 0;
    allInquiries.forEach((inq) => {
      inq.items.forEach((item) => {
        totalEstimatedB2BSales += item.quantity * item.price;
      });
    });

    res.status(200).json({
      success: true,
      analytics: {
        users: {
          totalClients: totalUsers,
        },
        products: {
          total: totalProducts,
          featured: featuredProductsCount,
        },
        inquiries: {
          total: totalInquiries,
          pending: pendingInquiries,
          reviewed: reviewedInquiries,
          completed: completedInquiries,
        },
        financials: {
          estimatedSalesValue: totalEstimatedB2BSales, // B2B contract estimates
        },
        recentInquiries,
      },
    });
  } catch (error) {
    next(error);
  }
};
// @desc    Get unified notification feed for admin
// @route   GET /api/v1/dashboard/notifications
// @access  Private/Admin
exports.getNotifications = async (req, res, next) => {
  try {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // last 30 days

    // 1. All recent inquiries (all statuses)
    const inquiries = await Inquiry.find({ createdAt: { $gte: since } })
      .select("name company email status items createdAt updatedAt")
      .sort({ updatedAt: -1 })
      .limit(20);

    // 2. Recent user registrations
    const newUsers = await User.find({ createdAt: { $gte: since }, role: "user" })
      .select("name email createdAt")
      .sort({ createdAt: -1 })
      .limit(10);

    // 3. Recent blog posts published
    const newBlogs = await Blog.find({ createdAt: { $gte: since }, status: "published" })
      .select("title category status createdAt")
      .sort({ createdAt: -1 })
      .limit(5);

    // 4. Low stock products (stock < 10)
    const lowStockProducts = await Product.find({ stock: { $lt: 10 } })
      .select("name stock updatedAt")
      .sort({ stock: 1 })
      .limit(5);

    // Build unified notification list
    const notifications = [];

    inquiries.forEach((inq) => {
      if (inq.status === "pending") {
        notifications.push({
          id: `inq-new-${inq._id}`,
          type: "inquiry_new",
          title: "New Inquiry Received",
          body: `${inq.name} from ${inq.company} submitted a new B2B inquiry.`,
          meta: `${inq.items?.length || 0} item${inq.items?.length !== 1 ? "s" : ""}`,
          href: "/admin/inquiries",
          timestamp: inq.createdAt,
          badge: "pending",
        });
      } else if (inq.status === "reviewed") {
        notifications.push({
          id: `inq-rev-${inq._id}`,
          type: "inquiry_reviewed",
          title: "Inquiry Under Review",
          body: `${inq.name} (${inq.company}) inquiry is being processed.`,
          meta: `${inq.items?.length || 0} item${inq.items?.length !== 1 ? "s" : ""}`,
          href: "/admin/inquiries",
          timestamp: inq.updatedAt,
          badge: "reviewed",
        });
      } else if (inq.status === "completed") {
        notifications.push({
          id: `inq-done-${inq._id}`,
          type: "inquiry_completed",
          title: "Inquiry Completed",
          body: `Order fulfilled for ${inq.name} at ${inq.company}.`,
          meta: `${inq.items?.length || 0} item${inq.items?.length !== 1 ? "s" : ""}`,
          href: "/admin/inquiries",
          timestamp: inq.updatedAt,
          badge: "completed",
        });
      }
    });

    newUsers.forEach((u) => {
      notifications.push({
        id: `user-${u._id}`,
        type: "user_registered",
        title: "New Client Registered",
        body: `${u.name} joined the platform.`,
        meta: u.email,
        href: "/admin/users",
        timestamp: u.createdAt,
        badge: "new user",
      });
    });

    newBlogs.forEach((b) => {
      notifications.push({
        id: `blog-${b._id}`,
        type: "blog_published",
        title: "Blog Post Published",
        body: `"${b.title}" was published under ${b.category}.`,
        meta: b.category,
        href: "/admin/blogs",
        timestamp: b.createdAt,
        badge: "published",
      });
    });

    lowStockProducts.forEach((p) => {
      notifications.push({
        id: `stock-${p._id}`,
        type: "low_stock",
        title: "Low Stock Alert",
        body: `"${p.name}" is running low — only ${p.stock} units left.`,
        meta: `${p.stock} units remaining`,
        href: "/admin/products",
        timestamp: p.updatedAt,
        badge: "low stock",
      });
    });

    // Sort all by most recent timestamp
    notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.status(200).json({
      success: true,
      count: notifications.length,
      unread: inquiries.filter(i => i.status === "pending").length,
      notifications: notifications.slice(0, 20),
    });
  } catch (error) {
    next(error);
  }
};

