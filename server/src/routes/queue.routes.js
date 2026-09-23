const express = require("express");
const { issueToken, myTokens, getToken, cancelToken } = require("../controllers/queueController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

router.post("/tokens", issueToken);
router.get("/tokens", myTokens);
router.get("/tokens/:id", getToken);
router.post("/tokens/:id/cancel", cancelToken);

module.exports = router;
