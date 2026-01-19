const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const dotenv = require("dotenv");
const sequelize = require("./config/database");

dotenv.config();

// Routes
const authRoutes = require("./routes/auth.route");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser());

// Session store
const sessionStore = new SequelizeStore({
  db: sequelize,
  tableName: "sessions",
});

app.use(
  session({
    secret: process.env.SESSION_SECRET || "cinema_secret",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 2, // 2 giờ
    },
  })
);

// Đồng bộ bảng session (phiên bản mới phải làm như sau)
sessionStore.sync({ alter: true }).then(() => {
  console.log("✅ Session table ready");
});

// Routes
app.use("/api/auth", authRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Backend is running" });
});

app.get("/api/session-test", (req, res) => {
  if (!req.session.views) req.session.views = 1;
  else req.session.views++;
  res.json({ views: req.session.views });
});

module.exports = app;
