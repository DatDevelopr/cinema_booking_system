const express = require("express");
const router = express.Router();

const regionController = require("../controllers/region.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { isAdmin } = require("../middlewares/role.middleware");

// Public
router.get("/", regionController.getAllRegions);

// Admin
router.post("/", verifyToken, isAdmin, regionController.createRegion);
router.put("/:id", verifyToken, isAdmin, regionController.updateRegion);
router.delete("/:id", verifyToken, isAdmin, regionController.deleteRegion);

module.exports = router;
