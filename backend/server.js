
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/database");

const authRoutes = require("./routes/auth.routes");
const profileRoutes = require("./routes/profile.routes");
const exerciseRoutes = require("./routes/exercise.routes");
const routineRoutes = require("./routes/routine.routes");
const nutritionRoutes = require("./routes/nutrition.routes"); 
const aiRoutes = require("./routes/ai.routes");

const app = express();

const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.get("/", (req, res) => {
    res.json({
        message: "FitLife API funcionando 🚀"
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/exercises", exerciseRoutes);
app.use("/api/routines", routineRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/routines", routineRoutes);
app.use("/api/nutrition", nutritionRoutes);
app.use("/api/ai", aiRoutes);

// Servidor
app.listen(PORT, () => {
    console.log(
        `🚀 Servidor ejecutándose en http://localhost:${PORT}`
    );
});

