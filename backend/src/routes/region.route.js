const express = require("express");
const router = express.Router();

const regionController = require("../controllers/region.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { isAdmin } = require("../middlewares/role.middleware");

// Public
router.get("/", regionController.getAllRegions);
router.get("/get-all", regionController.getAllRegions2);

// Admin
router.post("/", verifyToken, regionController.createRegion);
router.put("/:id", verifyToken, regionController.updateRegion);
router.delete("/:id", verifyToken, regionController.deleteRegion);

module.exports = router;
