
const db = require("../config/database");

const getExercises = async (req, res) => {
    try {

        const [exercises] = await db.query(
            `SELECT
                id,
                nombre,
                descripcion,
                grupo_muscular,
                dificultad,
                equipamiento,
                instrucciones,
                mediapipe_compatible
             FROM ejercicios
             ORDER BY nombre ASC`
        );

        res.json({
            success: true,
            exercises
        });

    } catch (error) {

        console.error("Error obteniendo ejercicios:", error);

        res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
};


const getExerciseById = async (req, res) => {
    try {

        const { id } = req.params;

        const [exercises] = await db.query(
            `SELECT
                id,
                nombre,
                descripcion,
                grupo_muscular,
                dificultad,
                equipamiento,
                instrucciones,
                mediapipe_compatible
             FROM ejercicios
             WHERE id = ?`,
            [id]
        );

        if (exercises.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Ejercicio no encontrado"
            });
        }

        res.json({
            success: true,
            exercise: exercises[0]
        });

    } catch (error) {

        console.error("Error obteniendo ejercicio:", error);

        res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
};


module.exports = {
    getExercises,
    getExerciseById
};

