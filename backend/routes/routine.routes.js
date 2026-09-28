
const express = require("express");

const {
    getRoutines,
    getRoutineById,
    createRoutine
} = require("../controllers/routineController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
    "/",
    authMiddleware,
    getRoutines
);

router.post(
    "/",
    authMiddleware,
    createRoutine
);

router.get(
    "/:id",
    authMiddleware,
    getRoutineById
);

module.exports = router;

