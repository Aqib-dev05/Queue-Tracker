const express = require("express");
const { adminQueue, callNext } = require("../controllers/queueController");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth, requireAdmin);

router.get("/queue", adminQueue);
router.post("/next", callNext);

module.exports = router;
