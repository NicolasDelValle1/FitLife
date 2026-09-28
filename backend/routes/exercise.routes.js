
const express = require("express");

const {
    getExercises,
    getExerciseById
} = require("../controllers/exerciseController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
    "/",
    authMiddleware,
    getExercises
);

router.get(
    "/:id",
    authMiddleware,
    getExerciseById
);

module.exports = router;

