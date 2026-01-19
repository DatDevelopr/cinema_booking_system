const app = require("./app");
const sequelize = require("./config/database");

const PORT = process.env.PORT || 5000;

// Test kết nối database trước khi start server
sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Database connected successfully");

    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err);
  });
