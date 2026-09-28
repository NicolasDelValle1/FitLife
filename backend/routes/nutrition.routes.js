
const express = require("express");

const {
    getNutritionPlans
} = require("../controllers/nutritionController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Obtener planes nutricionales del usuario
router.get(
    "/",
    authMiddleware,
    getNutritionPlans
);

module.exports = router;

