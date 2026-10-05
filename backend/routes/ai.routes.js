const express = require("express");

const {
    chatWithAI
} = require("../controllers/aiController");

const {
    generateRoutineWithAI
} = require("../controllers/aiRoutineController");

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


// =====================================================
// GENERAR RUTINA CON IA
// =====================================================

router.post(
    "/generate-routine",
    authMiddleware,
    generateRoutineWithAI
);


module.exports = router;
