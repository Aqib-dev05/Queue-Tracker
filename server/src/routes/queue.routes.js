const express = require("express");
const { publicStatus, issueToken, myTokens, cancelToken } = require("../controllers/queueController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// Anyone can see which token is being served.
router.get("/status", publicStatus);

router.use(requireAuth);
router.post("/tokens", issueToken);
router.get("/tokens", myTokens);
router.post("/tokens/:id/cancel", cancelToken);

module.exports = router;
