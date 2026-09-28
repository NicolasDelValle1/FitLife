
const db = require("../config/database");

const getProfile = async (req, res) => {
    try {

        const userId = req.user.id;

        const [rows] = await db.query(
            `SELECT
                u.id,
                u.nombre,
                u.email,
                p.edad,
                p.sexo,
                p.altura,
                p.peso,
                p.objetivo,
                p.nivel_actividad,
                p.fecha_actualizacion
             FROM usuarios u
             LEFT JOIN perfil_usuario p
                ON u.id = p.usuario_id
             WHERE u.id = ?`,
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado"
            });
        }

        res.json({
            success: true,
            profile: rows[0]
        });

    } catch (error) {

        console.error("Error obteniendo perfil:", error);

        res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
};


const saveProfile = async (req, res) => {

    try {

        const userId = req.user.id;

        const {
            edad,
            sexo,
            altura,
            peso,
            objetivo,
            nivel_actividad
        } = req.body || {};


        const [existingProfile] = await db.query(
            `SELECT id
             FROM perfil_usuario
             WHERE usuario_id = ?`,
            [userId]
        );


        if (existingProfile.length > 0) {

            await db.query(
                `UPDATE perfil_usuario
                 SET
                    edad = ?,
                    sexo = ?,
                    altura = ?,
                    peso = ?,
                    objetivo = ?,
                    nivel_actividad = ?
                 WHERE usuario_id = ?`,
                [
                    edad,
                    sexo,
                    altura,
                    peso,
                    objetivo,
                    nivel_actividad,
                    userId
                ]
            );

        } else {

            await db.query(
                `INSERT INTO perfil_usuario
                (
                    usuario_id,
                    edad,
                    sexo,
                    altura,
                    peso,
                    objetivo,
                    nivel_actividad
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    userId,
                    edad,
                    sexo,
                    altura,
                    peso,
                    objetivo,
                    nivel_actividad
                ]
            );
        }


        res.json({
            success: true,
            message: "Perfil actualizado correctamente"
        });


    } catch (error) {

        console.error("Error guardando perfil:", error);

        res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
};


module.exports = {
    getProfile,
    saveProfile
};

