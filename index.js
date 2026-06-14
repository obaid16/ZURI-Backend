const app = require("./src/app");

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Zuri B2B Sourcing API running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
});

// Capture unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.error(`Fatal Server Rejection Exception: ${err.message}`);
  // Terminate server and process
  server.close(() => process.exit(1));
});
