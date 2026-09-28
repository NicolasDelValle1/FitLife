
const db = require("../config/database");


// =====================================================
// OBTENER TODAS LAS RUTINAS DEL USUARIO
// =====================================================

const getRoutines = async (req, res) => {

    try {

        const userId = req.user.id;

        const [routines] = await db.query(
            `SELECT
                id,
                nombre,
                descripcion,
                objetivo,
                nivel,
                dias_semana,
                duracion_estimada,
                activa,
                creada_en
             FROM rutinas
             WHERE usuario_id = ?
             ORDER BY creada_en DESC`,
            [userId]
        );

        res.json({
            success: true,
            routines
        });

    } catch (error) {

        console.error("Error obteniendo rutinas:", error);

        res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
};


// =====================================================
// OBTENER UNA RUTINA POR ID
// =====================================================

const getRoutineById = async (req, res) => {

    try {

        const userId = req.user.id;
        const { id } = req.params;

        const [routines] = await db.query(
            `SELECT
                id,
                nombre,
                descripcion,
                objetivo,
                nivel,
                dias_semana,
                duracion_estimada,
                activa,
                creada_en
             FROM rutinas
             WHERE id = ?
             AND usuario_id = ?`,
            [id, userId]
        );

        if (routines.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Rutina no encontrada"
            });
        }


        const [exercises] = await db.query(
            `SELECT
                re.id,
                re.orden,
                re.series,
                re.repeticiones,
                re.tiempo_segundos,
                re.descanso_segundos,
                re.notas,

                e.id AS ejercicio_id,
                e.nombre,
                e.descripcion,
                e.grupo_muscular,
                e.dificultad,
                e.equipamiento,
                e.instrucciones,
                e.mediapipe_compatible

             FROM rutina_ejercicios re

             INNER JOIN ejercicios e
                ON re.ejercicio_id = e.id

             WHERE re.rutina_id = ?

             ORDER BY re.orden ASC`,
            [id]
        );


        res.json({
            success: true,

            routine: {
                ...routines[0],
                exercises
            }
        });


    } catch (error) {

        console.error("Error obteniendo rutina:", error);

        res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
};


// =====================================================
// CREAR UNA NUEVA RUTINA
// =====================================================

const createRoutine = async (req, res) => {

    const connection = await db.getConnection();

    try {

        const userId = req.user.id;

        const {
            nombre,
            descripcion,
            objetivo,
            nivel,
            dias_semana,
            duracion_estimada,
            exercises
        } = req.body;


        // ---------------------------------------------
        // VALIDAR CAMPOS
        // ---------------------------------------------

        if (!nombre || !objetivo || !nivel) {

            return res.status(400).json({
                success: false,
                message: "Nombre, objetivo y nivel son obligatorios"
            });
        }


        if (!Array.isArray(exercises) || exercises.length === 0) {

            return res.status(400).json({
                success: false,
                message: "Debes agregar al menos un ejercicio"
            });
        }


        // ---------------------------------------------
        // INICIAR TRANSACCIÓN
        // ---------------------------------------------

        await connection.beginTransaction();


        // ---------------------------------------------
        // CREAR RUTINA
        // ---------------------------------------------

        const [routineResult] = await connection.query(
            `INSERT INTO rutinas
            (
                usuario_id,
                nombre,
                descripcion,
                objetivo,
                nivel,
                dias_semana,
                duracion_estimada
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                userId,
                nombre,
                descripcion || null,
                objetivo,
                nivel,
                dias_semana || 1,
                duracion_estimada || null
            ]
        );


        const rutinaId = routineResult.insertId;


        // ---------------------------------------------
        // AGREGAR EJERCICIOS
        // ---------------------------------------------

        for (let i = 0; i < exercises.length; i++) {

            const ejercicio = exercises[i];

            await connection.query(
                `INSERT INTO rutina_ejercicios
                (
                    rutina_id,
                    ejercicio_id,
                    orden,
                    series,
                    repeticiones,
                    tiempo_segundos,
                    descanso_segundos,
                    notas
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    rutinaId,
                    ejercicio.ejercicio_id,
                    i + 1,
                    ejercicio.series || 3,
                    ejercicio.repeticiones || null,
                    ejercicio.tiempo_segundos || null,
                    ejercicio.descanso_segundos || 60,
                    ejercicio.notas || null
                ]
            );
        }


        // ---------------------------------------------
        // CONFIRMAR
        // ---------------------------------------------

        await connection.commit();


        res.status(201).json({
            success: true,
            message: "Rutina creada correctamente",
            routineId: rutinaId
        });


    } catch (error) {

        await connection.rollback();

        console.error("Error creando rutina:", error);

        res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });


    } finally {

        connection.release();
    }
};


// =====================================================
// EXPORTACIONES
// =====================================================

module.exports = {
    getRoutines,
    getRoutineById,
    createRoutine
};

