exports.isAdmin = (req, res, next) => {
  if (req.user.role_id !== 1) {
    return res.status(403).json({
      message: "Bạn không có quyền ADMIN",
    });
  }
  next();
};

exports.isUser = (req, res, next) => {
  if (req.user.role_id !== 2) {
    return res.status(403).json({
      message: "Chỉ USER mới được truy cập",
    });
  }
  next();
};

exports.isRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role_id)) {
      return res.status(403).json({
        message: "Bạn không có quyền truy cập",
      });
    }
    next();
  };
};