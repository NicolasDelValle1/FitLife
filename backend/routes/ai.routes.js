const express = require("express");

const {
    chatWithAI
} = require("../controllers/aiController");

const authMiddleware =
    require("../middleware/authMiddleware");

const router = express.Router();


// =====================================================
// CHAT NORMAL
// =====================================================

router.post(
    "/chat",
    authMiddleware,
    chatWithAI
);


// =====================================================
// CHAT STREAMING
// =====================================================

router.post(
    "/chat-stream",
    authMiddleware,
    chatWithAI
);


module.exports = router;

