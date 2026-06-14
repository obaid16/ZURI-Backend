const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Category = require("./src/models/Category");
const Product = require("./src/models/Product");

// Load env
dotenv.config();

const categoriesData = [
  { slug: "cap-materials", name: "Cap Materials", description: "High-grade buckram sheets, rigid templates, and components for cap shaping.", image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&q=80&w=800" },
  { slug: "fabrics", name: "Fabrics", description: "Brushed cotton twill fabric, stretch corduroy, and poly meshes.", image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800" },
  { slug: "threads", name: "Threads", description: "High-tensile polyester sewing threads and industrial embroidery spools.", image: "https://images.unsplash.com/photo-1527018601619-a508a2be00cd?auto=format&fit=crop&q=80&w=800" },
  { slug: "accessories", name: "Accessories", description: "Comfort sweatbands, visors, eyelets, and adjustable closures.", image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=800" },
  { slug: "ready-caps", name: "Ready Caps", description: "Premium blanks including structured snapbacks, trucker caps, and dad hats.", image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=800" },
  { slug: "clothing", name: "Clothing", description: "B2B blank corporate apparel, tees, hoodies, and uniform templates.", image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=800" },
  { slug: "custom-mfg", name: "Custom Manufacturing", description: "Bespoke 3D embroidery, laser-etched leather patches, and sizing configurations.", image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=800" },
  { slug: "packaging", name: "Packaging", description: "Custom bulk shipping boxes, dust bags, and retail cap display boxes.", image: "https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&q=80&w=800" }
];

const productsData = [
  {
    name: "5 Panel Cotton Twill Cap",
    categorySlug: "ready-caps",
    moq: 50,
    tiers: [
      { qty: 50, price: 2.80 },
      { qty: 100, price: 2.50 },
      { qty: 500, price: 2.20 }
    ],
    images: [
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=800"
    ],
    materialType: "100% Brushed Cotton",
    availableColors: ["Slate Black", "Charcoal", "Navy", "Sand"],
    stock: 1000,
    featured: true,
    description: "Unstructured mid-profile five-panel blank cap. Made from brushed cotton twill canvas. Features a curved bill, stitched eyelets, and self-fabric brass adjuster.",
    tags: ["cap", "5-panel", "cotton", "twill"]
  },
  {
    name: "6 Panel Snapback Cap",
    categorySlug: "ready-caps",
    moq: 50,
    tiers: [
      { qty: 50, price: 3.50 },
      { qty: 100, price: 3.00 },
      { qty: 500, price: 2.70 }
    ],
    images: [
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&q=80&w=800"
    ],
    materialType: "80% Acrylic / 20% Wool Blend",
    availableColors: ["Solid Black", "Dark Gray", "Navy", "White"],
    stock: 1500,
    featured: true,
    description: "Structured high-profile six-panel blank snapback cap. Features double-stiffened buckram front panels, classic green under-visor, and plastic snap closure.",
    tags: ["cap", "6-panel", "snapback", "acrylic", "wool"]
  },
  {
    name: "Mesh Trucker Cap",
    categorySlug: "ready-caps",
    moq: 50,
    tiers: [
      { qty: 50, price: 2.40 },
      { qty: 100, price: 2.20 },
      { qty: 500, price: 1.95 }
    ],
    images: [
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1527018601619-a508a2be00cd?auto=format&fit=crop&q=80&w=800"
    ],
    materialType: "Polyester Mesh Back, Cotton Front",
    availableColors: ["Standard"],
    stock: 2000,
    featured: true,
    description: "Classic semi-structured trucker cap. Combines cotton twill front panels with a high-durability honeycomb mesh backing. Standard adjustable plastic closure.",
    tags: ["cap", "trucker", "mesh", "polyester"]
  },
  {
    name: "Cotton Twill Fabric",
    categorySlug: "fabrics",
    moq: 20,
    tiers: [
      { qty: 20, price: 4.50 },
      { qty: 100, price: 4.20 },
      { qty: 500, price: 3.80 }
    ],
    images: [
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=800"
    ],
    materialType: "100% Organic Cotton",
    availableColors: ["Midnight Black", "Charcoal", "Navy", "Desert Sand"],
    stock: 5000,
    featured: true,
    description: "Heavyweight brushed cotton twill canvas. Woven at 320gsm. Resilient to structural fading. Excellent for blank caps and custom garment creation.",
    tags: ["fabric", "cotton", "twill", "roll"]
  },
  {
    name: "Polyester Mesh Fabric",
    categorySlug: "fabrics",
    moq: 20,
    tiers: [
      { qty: 20, price: 3.20 },
      { qty: 100, price: 3.00 },
      { qty: 500, price: 2.70 }
    ],
    images: [
      "https://images.unsplash.com/photo-1527018601619-a508a2be00cd?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800"
    ],
    materialType: "100% Recycled Polyester",
    availableColors: ["Standard"],
    stock: 4000,
    featured: false,
    description: "Rigid honeycomb polyester mesh sheets. Provides structural durability and cooling ventilation. Specifically formulated to avoid softening under heat presses.",
    tags: ["fabric", "polyester", "mesh", "honeycomb"]
  },
  {
    name: "Sweatband",
    categorySlug: "accessories",
    moq: 100,
    tiers: [
      { qty: 100, price: 0.20 },
      { qty: 500, price: 0.18 },
      { qty: 2000, price: 0.15 }
    ],
    images: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&q=80&w=800"
    ],
    materialType: "Cushioned Cotton Core, Moisture Polyester Wrap",
    availableColors: ["Black", "White", "Gray"],
    stock: 10000,
    featured: false,
    description: "Multi-layered comfort cotton cap sweatbands. Built with moisture-wicking technology and a cushioned inner core. Pre-sewn with double needle guides.",
    tags: ["accessory", "sweatband", "cotton", "polyester"]
  },
  {
    name: "Brass Slide Buckle Set",
    categorySlug: "accessories",
    moq: 500,
    tiers: [
      { qty: 500, price: 0.35 },
      { qty: 1000, price: 0.28 },
      { qty: 5000, price: 0.22 }
    ],
    images: [
      "https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=800"
    ],
    materialType: "Solid Brass",
    availableColors: ["Standard"],
    stock: 25000,
    featured: false,
    description: "Premium solid brass closures for cap adjustment. Featuring a rustic brushed gold finish, salt spray test compliance, and matches 16mm straps.",
    tags: ["accessory", "brass", "buckle", "closure"]
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Seeder database connection established.");

    // Delete existing records
    await Category.deleteMany();
    await Product.deleteMany();
    console.log("Existing Category and Product records cleared.");

    // Create Categories
    const createdCategories = await Category.insertMany(categoriesData);
    console.log(`${createdCategories.length} Categories seeded.`);

    // Map product data to created categories using slug matching
    const mappedProducts = productsData.map(prod => {
      const matchCat = createdCategories.find(c => c.slug === prod.categorySlug);
      if (!matchCat) {
        throw new Error(`Category match not found for slug: ${prod.categorySlug}`);
      }
      return {
        name: prod.name,
        description: prod.description,
        category: matchCat._id,
        moq: prod.moq,
        tiers: prod.tiers,
        images: prod.images,
        materialType: prod.materialType,
        availableColors: prod.availableColors,
        stock: prod.stock,
        featured: prod.featured,
        tags: prod.tags
      };
    });

    // Create Products
    const createdProducts = await Product.insertMany(mappedProducts);
    console.log(`${createdProducts.length} Products seeded.`);

    console.log("Database successfully seeded!");
    process.exit(0);
  } catch (error) {
    console.error(`Seeder failed: ${error.message}`);
    process.exit(1);
  }
};

seedDB();
