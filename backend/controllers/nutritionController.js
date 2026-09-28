
const db = require("../config/database");

// ==========================================
// OBTENER PLANES NUTRICIONALES DEL USUARIO
// ==========================================
const getNutritionPlans = async (req, res) => {
    try {
        const userId = req.user.id;

        const [plans] = await db.query(
            `SELECT
                id,
                nombre_plan,
                descripcion,
                calorias_diarias,
                tipo_dieta,
                fecha_creacion
             FROM planes_nutricionales
             WHERE id_usuario = ?
             ORDER BY fecha_creacion DESC`,
            [userId]
        );

        // Si el usuario todavía no tiene planes
        if (plans.length === 0) {
            return res.json({
                success: true,
                plans: []
            });
        }

        // Obtener comidas de todos los planes
        const planIds = plans.map(plan => plan.id);

        const placeholders = planIds.map(() => "?").join(",");

        const [meals] = await db.query(
            `SELECT
                id,
                id_plan,
                nombre_comida,
                tipo_comida,
                descripcion,
                calorias,
                proteinas,
                carbohidratos,
                grasas
             FROM comidas
             WHERE id_plan IN (${placeholders})
             ORDER BY
                FIELD(tipo_comida, 'desayuno', 'almuerzo', 'snack', 'cena'),
                id ASC`,
            planIds
        );

        // Relacionar comidas con cada plan
        const plansWithMeals = plans.map(plan => ({
            ...plan,
            comidas: meals.filter(
                meal => meal.id_plan === plan.id
            )
        }));

        res.json({
            success: true,
            plans: plansWithMeals
        });

    } catch (error) {
        console.error(
            "Error obteniendo planes nutricionales:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
};

module.exports = {
    getNutritionPlans
};

