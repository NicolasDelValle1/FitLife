
const db = require("../config/database");


// =====================================================
// GENERAR RUTINA CON FITLIFE IA
// =====================================================

const generateRoutineWithAI = async (req, res) => {

    try {

        const userId = req.user.id;

        const {
            objetivo,
            nivel,
            dias_semana,
            duracion_estimada
        } = req.body;


        // =================================================
        // 1. VALIDAR DATOS
        // =================================================

        if (!objetivo || !nivel) {

            return res.status(400).json({
                success: false,
                message: "Objetivo y nivel son obligatorios"
            });

        }


        // =================================================
        // 2. CONFIGURACIÓN NVIDIA
        // =================================================

        const apiKey =
            process.env.NVIDIA_API_KEY;

        const model =
            process.env.NVIDIA_MODEL ||
            "z-ai/glm-5.3-flash";


        if (!apiKey) {

            return res.status(500).json({
                success: false,
                message:
                    "NVIDIA_API_KEY no está configurada"
            });

        }


        // =================================================
        // 3. OBTENER INFORMACIÓN DEL USUARIO
        // =================================================

        const [usuarios] = await db.query(
            `
            SELECT
                id,
                nombre,
                goal,
                experience,
                training_days,
                diet_preference,
                medical
            FROM usuarios
            WHERE id = ?
            AND activo = 1
            LIMIT 1
            `,
            [userId]
        );


        if (usuarios.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado"
            });

        }


        const usuario = usuarios[0];


        // =================================================
        // 4. OBTENER EJERCICIOS DISPONIBLES
        // =================================================

        const [ejercicios] = await db.query(
            `
            SELECT
                id,
                nombre,
                descripcion,
                grupo_muscular,
                dificultad,
                equipamiento,
                instrucciones,
                mediapipe_compatible
            FROM ejercicios
            ORDER BY id ASC
            LIMIT 50
            `
        );


        if (ejercicios.length === 0) {

            return res.status(404).json({
                success: false,
                message:
                    "No hay ejercicios disponibles en FitLife"
            });

        }


        // =================================================
        // 5. CREAR CATÁLOGO DE EJERCICIOS
        // =================================================

        const catalogoEjercicios =
            ejercicios.map((ejercicio) => {

                return `
ID: ${ejercicio.id}
Nombre: ${ejercicio.nombre}
Grupo muscular: ${ejercicio.grupo_muscular || "No especificado"}
Dificultad: ${ejercicio.dificultad || "No especificada"}
Equipamiento: ${ejercicio.equipamiento || "No especificado"}
MediaPipe compatible: ${
    ejercicio.mediapipe_compatible ? "Sí" : "No"
}
                `;

            }).join("\n");


        // =================================================
        // 6. PROMPT PARA NVIDIA
        // =================================================

        const prompt = `
Eres FitLife IA y debes crear una rutina de entrenamiento
estructurada para un usuario de FitLife.

INFORMACIÓN DEL USUARIO:

Nombre:
${usuario.nombre}

Objetivo registrado:
${usuario.goal || "No especificado"}

Nivel:
${usuario.experience || "No especificado"}

Días de entrenamiento:
${usuario.training_days || "No especificado"}

Condición médica registrada:
${usuario.medical || "Ninguna"}


DATOS SOLICITADOS PARA ESTA RUTINA:

Objetivo:
${objetivo}

Nivel:
${nivel}

Días por semana:
${dias_semana || usuario.training_days || 3}

Duración aproximada:
${duracion_estimada || 40} minutos


EJERCICIOS DISPONIBLES EN FITLIFE:

${catalogoEjercicios}


REGLAS IMPORTANTES:

1. Utiliza únicamente ejercicios cuyo ID aparezca en el
   catálogo proporcionado.

2. No inventes IDs.

3. No inventes ejercicios que no estén en el catálogo.

4. Selecciona ejercicios apropiados para el objetivo y nivel.

5. La rutina debe ser razonable y general.

6. No proporciones recomendaciones extremas.

7. Si la condición médica registrada puede requerir
   valoración profesional, evita presentar la rutina
   como una recomendación médica personalizada.

8. Devuelve ÚNICAMENTE JSON válido.

9. No incluyas markdown.

10. No incluyas explicaciones fuera del JSON.


FORMATO OBLIGATORIO:

{
    "nombre": "Nombre de la rutina",
    "descripcion": "Descripción breve",
    "objetivo": "Objetivo",
    "nivel": "Nivel",
    "dias_semana": 3,
    "duracion_estimada": 40,
    "exercises": [
        {
            "ejercicio_id": 1,
            "series": 3,
            "repeticiones": 10,
            "tiempo_segundos": null,
            "descanso_segundos": 60,
            "notas": "Nota breve"
        }
    ]
}

IMPORTANTE:

- "ejercicio_id" debe existir en el catálogo.
- "repeticiones" puede ser null cuando corresponda.
- "tiempo_segundos" puede ser null cuando corresponda.
- Usa entre 4 y 8 ejercicios.
- No agregues campos adicionales.
        `;


        // =================================================
        // 7. LLAMAR A NVIDIA
        // =================================================

        console.log("====================================");
        console.log("🤖 Generando rutina con IA");
        console.log("👤 Usuario:", usuario.nombre);
        console.log("🎯 Objetivo:", objetivo);
        console.log("📈 Nivel:", nivel);
        console.log("📡 Modelo:", model);
        console.log("====================================");


        const response = await fetch(
            "https://integrate.api.nvidia.com/v1/chat/completions",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },

                body: JSON.stringify({

                    model: model,

                    messages: [
                        {
                            role: "system",
                            content:
                                "Genera únicamente JSON válido según las instrucciones."
                        },
                        {
                            role: "user",
                            content: prompt
                        }
                    ],

                    temperature: 0.3,
                    top_p: 1,
                    max_tokens: 1200,

                    response_format: {
                        type: "json_object"
                    },

                    stream: false
                })
            }
        );


        // =================================================
        // 8. COMPROBAR RESPUESTA NVIDIA
        // =================================================

        console.log(
            "📡 NVIDIA respondió:",
            response.status
        );


        if (!response.ok) {

            const errorText =
                await response.text();

            console.error(
                "❌ Error NVIDIA:",
                errorText
            );

            return res.status(
                response.status
            ).json({
                success: false,
                message:
                    "Error generando la rutina con NVIDIA"
            });

        }


        // =================================================
        // 9. LEER RESPUESTA
        // =================================================

        const data =
            await response.json();


        const contenido =
            data
                ?.choices?.[0]
                ?.message
                ?.content;


        if (!contenido) {

            return res.status(500).json({
                success: false,
                message:
                    "NVIDIA no devolvió una rutina"
            });

        }


        // =================================================
        // 10. CONVERTIR JSON
        // =================================================

        let rutina;

        try {

            rutina =
                JSON.parse(contenido);

        } catch (error) {

            console.error(
                "❌ JSON generado por IA:",
                contenido
            );

            return res.status(500).json({
                success: false,
                message:
                    "La IA devolvió un formato inválido"
            });

        }


        // =================================================
        // 11. VALIDAR ESTRUCTURA
        // =================================================

        if (
            !rutina.nombre ||
            !rutina.objetivo ||
            !rutina.nivel ||
            !Array.isArray(rutina.exercises) ||
            rutina.exercises.length === 0
        ) {

            return res.status(500).json({
                success: false,
                message:
                    "La rutina generada está incompleta"
            });

        }


        // =================================================
        // 12. VALIDAR IDs CONTRA LA BD
        // =================================================

        const idsDisponibles =
            new Set(
                ejercicios.map(
                    ejercicio =>
                        Number(ejercicio.id)
                )
            );


        const ejerciciosInvalidos =
            rutina.exercises.filter(
                ejercicio =>
                    !idsDisponibles.has(
                        Number(ejercicio.ejercicio_id)
                    )
            );


        if (ejerciciosInvalidos.length > 0) {

            console.error(
                "❌ La IA generó IDs inexistentes:",
                ejerciciosInvalidos
            );

            return res.status(500).json({
                success: false,
                message:
                    "La IA seleccionó ejercicios no disponibles"
            });

        }


        // =================================================
        // 13. RESPUESTA
        // =================================================

        console.log(
            "✅ Rutina generada correctamente"
        );


        return res.json({
            success: true,
            message:
                "Rutina generada correctamente",
            routine: rutina
        });


    } catch (error) {

        console.error(
            "❌ Error generando rutina con IA:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Error interno generando la rutina"
        });

    }

};


// =====================================================
// EXPORTAR
// =====================================================

module.exports = {
    generateRoutineWithAI
};
