const bcrypt = require("bcrypt");
const { User, Role } = require("../models"); // Sequelize models

// Register
exports.register = async (req, res) => {
  try {
    const { full_name, email, password, phone, role } = req.body;

    // Check existing email
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Find role
    const roleRecord = await Role.findOne({ where: { role_name: role || "CUSTOMER" } });

    const newUser = await User.create({
      full_name,
      email,
      password_hash,
      phone,
      role_id: roleRecord.role_id,
    });

    res.json({ message: "Register success", user_id: newUser.user_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(400).json({ message: "Incorrect password" });

    // Save session
    req.session.user = {
      id: user.user_id,
      full_name: user.full_name,
      role: (await Role.findByPk(user.role_id)).role_name,
    };

    res.json({ message: "Login success", session: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Logout
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: "Logout failed" });
    res.clearCookie("cinema.sid");
    res.json({ message: "Logout success" });
  });
};

// Check current user session
exports.me = (req, res) => {
  if (req.session.user) res.json({ user: req.session.user });
  else res.status(401).json({ message: "Not logged in" });
};
