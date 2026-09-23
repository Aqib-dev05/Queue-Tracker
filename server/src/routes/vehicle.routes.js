const express = require("express");
const {
  listMyVehicles,
  createVehicle,
  getVehicle,
  deleteVehicle,
} = require("../controllers/vehicleController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

router.get("/", listMyVehicles);
router.post("/", createVehicle);
router.get("/:id", getVehicle);
router.delete("/:id", deleteVehicle);

module.exports = router;
