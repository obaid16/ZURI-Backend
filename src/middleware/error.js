// Centralized Express Error Handling Middleware
module.exports = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log details for debugging in development environment
  console.error(err);

  // Mongoose Cast Error (e.g. invalid ObjectId)
  if (err.name === "CastError") {
    const message = `Resource not found with format id of ${err.value}`;
    error = { status: 404, message };
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const message = "Duplicate record value entered. Database record must be unique.";
    error = { status: 400, message };
  }

  // Mongoose Validation Error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((val) => val.message).join(", ");
    error = { status: 400, message };
  }

  res.status(error.status || 500).json({
    success: false,
    message: error.message || "Internal server crash exception.",
  });
};
// 
