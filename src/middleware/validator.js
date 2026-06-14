// Reusable validation checks
const validateEmail = (email) => {
  return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
};

exports.validateRegister = (req, res, next) => {
  const { name, email, password, company, phone } = req.body;
  
  if (!name || !email || !password || !company || !phone) {
    return res.status(400).json({
      success: false,
      message: "Please provide name, email, password, company, and phone fields.",
    });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid email format.",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters.",
    });
  }

  next();
};

exports.validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide email and password coordinates.",
    });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid email format.",
    });
  }

  next();
};

exports.validateProduct = (req, res, next) => {
  const { name, description, category, moq, tiers, materialType } = req.body;

  if (!name || !description || !category || !moq || !tiers || !materialType) {
    return res.status(400).json({
      success: false,
      message: "Missing parameters. Required: name, description, category, moq, tiers (pricing brackets), materialType.",
    });
  }

  if (parseInt(moq) < 1) {
    return res.status(400).json({
      success: false,
      message: "Minimum Order Quantity (MOQ) must be at least 1 unit.",
    });
  }

  next();
};

exports.validateInquiry = (req, res, next) => {
  const { name, company, email, phone, details, items } = req.body;

  if (!name || !company || !email || !phone || !details || !items) {
    return res.status(400).json({
      success: false,
      message: "Procurement details required: name, company, email, phone, details, and items array.",
    });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid contact email format.",
    });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Inquiry items catalog list cannot be empty.",
    });
  }

  next();
};
