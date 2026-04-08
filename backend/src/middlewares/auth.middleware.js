const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log("VERIFY TOKEN:", decoded);

    // Sửa ở đây: dùng key thực tế trong payload
    req.user = {
      user_id: decoded.id,       // ← sửa thành decoded.id
      role_id: decoded.role,     // ← sửa thành decoded.role (hoặc decoded.role_id nếu bạn đổi sau này)
    };

    next();

  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Access token expired" });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
};
