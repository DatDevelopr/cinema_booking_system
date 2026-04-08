const router = require("express").Router();
const upload = require("../middlewares/upload.middleware");

router.post("/", upload.single("image"), (req, res) => {
  res.json({
    url: req.file.path,
  });
});

module.exports = router;