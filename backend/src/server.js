// src/server.js
require("dotenv").config();
const app = require("./app");
const { sequelize } = require("./models");

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ MySQL connected");

    app.listen(process.env.PORT, () => {
      console.log(`🚀 Server running at http://localhost:${process.env.PORT}`);
    });
  } catch (error) {
    console.error("❌ Unable to connect to DB:", error);
  }
})();
