const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

/**
 * Sequelize database configuration
 * Establishes connection to MySQL database using environment variables
 */
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306, // Default MySQL port
    dialect: "mysql",
    logging: process.env.NODE_ENV === "development" ? console.log : false, // Enable logging in development
    pool: {
      max: 5, // Maximum number of connections
      min: 0, // Minimum number of connections
      acquire: 30000, // Maximum time (ms) to get connection before throwing error
      idle: 10000, // Maximum time (ms) connection can be idle before being released
    },
    define: {
      timestamps: true, // Add createdAt and updatedAt fields by default
      underscored: true, // Use snake_case for automatically added fields
    },
  }
);

/**
 * Test database connection
 * Logs success or failure to console
 */
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1); // Exit process on connection failure
  }
};

// Test connection on module load
testConnection();

module.exports = sequelize;
