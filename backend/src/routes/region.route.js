const router = require("express").Router();
const regionController = require("../controllers/region.controller");
const {verifyToken} = require("../middlewares/auth.middleware");
const { isAdmin } = require("../middlewares/role.middleware");

router.get("/", regionController.getAllRegions);
router.post("/", verifyToken, isAdmin, regionController.createRegion);

module.exports = router;
