const mongoose = require("mongoose");

const SettingsSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      default: "ZURI ENTERPRISES",
    },
    address: {
      type: String,
      default: "Zuri Enterprises, Mumbai, Maharashtra, India",
    },
    email: {
      type: String,
      default: "wholesale@zurienterprises.com",
    },
    phone: {
      type: String,
      default: "+91 75062 51326",
    },
    socialLinks: {
      facebook: { type: String, default: "" },
      instagram: { type: String, default: "" },
      twitter: { type: String, default: "" },
      linkedin: { type: String, default: "" },
    },
    seo: {
      defaultTitle: { type: String, default: "Zuri Enterprises - Premium Wholesale Sourcing" },
      defaultDescription: { type: String, default: "Premium textile, cap components, and custom embroidery manufacturing." },
      keywords: { type: String, default: "b2b, wholesale, fabrics, caps, packaging" },
    },
    hero: {
      title: { type: String, default: "PREMIUM WHOLESALE SOURCING" },
      subtitle: { type: String, default: "ZURI ENTERPRISES" },
      description: { type: String, default: "Direct manufacturer pricing for custom cap materials, fabrics, accessories, and B2B blank apparel." },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Settings", SettingsSchema);
