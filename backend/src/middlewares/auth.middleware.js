const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      return res.status(401).json({
        message: "Không có token",
      });
    }

    const token = authHeader.split(" ")[1]; // Bearer xxx

    if (!token) {
      return res.status(401).json({
        message: "Token không hợp lệ",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      user_id: decoded.user_id,
      role_id: decoded.role_id,
    };

    next();
  } catch (error) {
    // 4. Token hết hạn
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token đã hết hạn, vui lòng đăng nhập lại",
      });
    }

    // 5. Token không hợp lệ
    return res.status(401).json({
      message: "Token không hợp lệ",
    });
  }
};
