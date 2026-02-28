const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    /* ❌ Không có Authorization */
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    /* ⭐ Lấy token */
    const token = authHeader.split(" ")[1];

    /* ⭐ Verify access token */
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );

    /* ⭐ Gắn user vào request */
    req.user = {
      user_id: decoded.user_id,
      role_id: decoded.role_id,
    };

    next();

  } catch (error) {

    /* ❌ Token hết hạn */
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Access token expired",
      });
    }

    /* ❌ Token sai */
    return res.status(401).json({
      message: "Invalid token",
    });
  }
};
