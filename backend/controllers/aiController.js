const pool = require("../config/database");

const chatWithAI = async (req, res) => {

    try {

        // =====================================================
        // 1. OBTENER MENSAJE Y USUARIO
        // =====================================================

        const { message } = req.body;

        const usuarioId = req.user?.id;

        if (!message || !message.trim()) {

            return res.status(400).json({
                success: false,
                message: "El mensaje es obligatorio"
            });

        }

        if (!usuarioId) {

            return res.status(401).json({
                success: false,
                message: "No se pudo identificar al usuario"
            });

        }

        // =====================================================
        // 2. CONFIGURACIÓN NVIDIA
        // =====================================================

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

        // =====================================================
        // 3. BUSCAR INFORMACIÓN DEL USUARIO
        // =====================================================

        const [usuarios] = await pool.query(
            `
            SELECT
                id,
                nombre,
                email,
                medical,
                goal,
                experience,
                training_days,
                diet_preference
            FROM usuarios
            WHERE id = ?
            AND activo = 1
            LIMIT 1
            `,
            [usuarioId]
        );

        if (usuarios.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado"
            });

        }

        const usuario = usuarios[0];

        // =====================================================
        // 4. BUSCAR RUTINAS ACTIVAS
        // =====================================================

        const [rutinas] = await pool.query(
            `
            SELECT
                id,
                nombre,
                descripcion,
                objetivo,
                nivel,
                dias_semana,
                duracion_estimada
            FROM rutinas
            WHERE usuario_id = ?
            AND activa = 1
            ORDER BY creada_en DESC
            `,
            [usuarioId]
        );

        // =====================================================
        // 5. BUSCAR PLAN NUTRICIONAL
        // =====================================================

        const [planes] = await pool.query(
            `
            SELECT
                id,
                nombre_plan,
                descripcion,
                calorias_diarias,
                tipo_dieta,
                fecha_creacion
            FROM planes_nutricionales
            WHERE id_usuario = ?
            ORDER BY fecha_creacion DESC
            LIMIT 1
            `,
            [usuarioId]
        );

        let comidas = [];

        // =====================================================
        // 6. BUSCAR COMIDAS DEL PLAN
        // =====================================================

        if (planes.length > 0) {

            const planId =
                planes[0].id;

            const [comidasDB] =
                await pool.query(
                    `
                    SELECT
                        id,
                        nombre_comida,
                        tipo_comida,
                        descripcion,
                        calorias,
                        proteinas,
                        carbohidratos,
                        grasas
                    FROM comidas
                    WHERE id_plan = ?
                    ORDER BY
                        FIELD(
                            tipo_comida,
                            'desayuno',
                            'almuerzo',
                            'cena',
                            'snack'
                        ),
                        id
                    `,
                    [planId]
                );

            comidas = comidasDB;
        }

        // =====================================================
        // 7. CONSTRUIR INFORMACIÓN DEL USUARIO
        // =====================================================

        const informacionUsuario = `
INFORMACIÓN DEL USUARIO DE FITLIFE

Nombre:
${usuario.nombre}

Objetivo:
${usuario.goal || "No especificado"}

Nivel de experiencia:
${usuario.experience || "No especificado"}

Días de entrenamiento por semana:
${usuario.training_days || "No especificado"}

Preferencia alimentaria:
${usuario.diet_preference || "Ninguna"}

Condición médica registrada:
${usuario.medical || "Ninguna"}
        `;

        // =====================================================
        // 8. CONSTRUIR INFORMACIÓN DE RUTINAS
        // =====================================================

        let informacionRutinas =
            "\nRUTINAS ACTIVAS DEL USUARIO\n";

        if (rutinas.length === 0) {

            informacionRutinas +=
                "El usuario no tiene rutinas activas.\n";

        } else {

            rutinas.forEach((rutina, index) => {

                informacionRutinas += `
Rutina ${index + 1}:
- Nombre: ${rutina.nombre}
- Descripción: ${rutina.descripcion || "Sin descripción"}
- Objetivo: ${rutina.objetivo || "No especificado"}
- Nivel: ${rutina.nivel || "No especificado"}
- Días por semana: ${rutina.dias_semana || "No especificado"}
- Duración estimada: ${rutina.duracion_estimada || "No especificada"} minutos
                `;

            });

        }

        // =====================================================
        // 9. CONSTRUIR INFORMACIÓN NUTRICIONAL
        // =====================================================

        let informacionNutricion =
            "\nPLAN NUTRICIONAL DEL USUARIO\n";

        if (planes.length === 0) {

            informacionNutricion +=
                "El usuario no tiene un plan nutricional registrado.\n";

        } else {

            const plan =
                planes[0];

            informacionNutricion += `
Plan:
- Nombre: ${plan.nombre_plan}
- Descripción: ${plan.descripcion || "Sin descripción"}
- Calorías diarias: ${plan.calorias_diarias || "No especificadas"}
- Tipo de dieta: ${plan.tipo_dieta || "No especificado"}
            `;

            if (comidas.length > 0) {

                informacionNutricion +=
                    "\nComidas del plan:\n";

                comidas.forEach((comida) => {

                    informacionNutricion += `
- ${comida.tipo_comida}: ${comida.nombre_comida}
  Descripción: ${comida.descripcion || "Sin descripción"}
  Calorías: ${comida.calorias || "No especificadas"}
  Proteínas: ${comida.proteinas || "No especificadas"} g
  Carbohidratos: ${comida.carbohidratos || "No especificados"} g
  Grasas: ${comida.grasas || "No especificadas"} g
                    `;

                });

            }

        }

        // =====================================================
        // 10. CONTEXTO COMPLETO
        // =====================================================

        const contextoFitLife = `
=====================================================
CONTEXTO DEL USUARIO EN FITLIFE
=====================================================

${informacionUsuario}

${informacionRutinas}

${informacionNutricion}

=====================================================
FIN DEL CONTEXTO
=====================================================
        `;

        // =====================================================
        // 11. LOGS
        // =====================================================

        console.log("====================================");
        console.log("🤖 Modelo:", model);
        console.log("👤 Usuario ID:", usuarioId);
        console.log("👤 Usuario:", usuario.nombre);
        console.log("💬 Mensaje:", message);
        console.log("🏋️ Rutinas:", rutinas.length);
        console.log("🥗 Planes:", planes.length);
        console.log("🍎 Comidas:", comidas.length);
        console.log("📡 Conectando con NVIDIA...");
        console.log("====================================");

        // =====================================================
        // 12. LLAMAR A NVIDIA
        // =====================================================

        const response = await fetch(
            "https://integrate.api.nvidia.com/v1/chat/completions",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization":
                        `Bearer ${apiKey}`,
                    "Accept":
                        "text/event-stream"
                },

                body: JSON.stringify({

                    model: model,

                    messages: [

                        // =====================================
                        // SYSTEM PROMPT
                        // =====================================

                        {
                            role: "system",

                            content: `
Eres FitLife IA, el asistente inteligente
de la aplicación FitLife.

Tu función es ayudar al usuario con:

- entrenamiento general
- ejercicios
- organización de rutinas
- alimentación equilibrada
- hábitos saludables
- objetivos de actividad física
- seguimiento general dentro de FitLife

Tienes acceso al contexto del usuario proporcionado
por FitLife.

IMPORTANTE:

1. Utiliza el contexto del usuario cuando sea relevante.

2. Personaliza tus respuestas según su objetivo,
   experiencia, días de entrenamiento, rutinas y
   alimentación registrada.

3. No inventes información que no aparezca en el contexto.

4. Si un dato no está disponible, dilo claramente.

5. No reveles al usuario información técnica como
   consultas SQL, nombres de tablas, tokens o claves.

6. No digas que tienes acceso directo a la base de datos.
   Simplemente utiliza la información proporcionada.

7. Responde siempre en español.

8. Sé amable, claro y conciso.

9. Evita respuestas innecesariamente largas.

10. Usa listas cuando ayuden a organizar la información.

11. No realices diagnósticos médicos.

12. No sustituyas a médicos, nutricionistas u otros
    profesionales cualificados.

13. No recomiendes prácticas extremas.

14. Si una pregunta requiere valoración profesional,
    indícalo de forma clara y breve.

15. Cuando el usuario pregunte por sus rutinas,
    alimentación u objetivos, utiliza primero los
    datos específicos de su perfil.

16. No confundas recomendaciones generales con datos
    que realmente estén registrados en FitLife.

17. No presentes explicaciones fisiológicas como hechos si
    no son necesarias para responder.

18. Cuando proporciones recomendaciones de entrenamiento
    o alimentación, mantén un enfoque general y prudente.

19. Diferencia claramente entre:
    - información registrada del usuario
    - recomendaciones de FitLife IA
    - información que no está disponible.

20. Nunca inventes rutinas, comidas, medidas, resultados,
    antecedentes o datos personales como si estuvieran
    registrados.

21. Si el usuario solicita crear una rutina o plan,
    primero puedes proponerlo en la conversación, pero no
    afirmes que fue guardado hasta que el sistema confirme
    que realmente se almacenó.

22. Si el usuario pide modificar o guardar información,
    explica qué acción se propone antes de realizarla.

Tu objetivo es funcionar como un asistente práctico,
personalizado y fácil de usar dentro de FitLife.

=====================================================
CONTEXTO DEL USUARIO
=====================================================

${contextoFitLife}

=====================================================
FIN DEL CONTEXTO
=====================================================
                            `
                        },

                        // =====================================
                        // USER MESSAGE
                        // =====================================

                        {
                            role: "user",
                            content: message
                        }

                    ],

                    temperature: 0.5,
                    top_p: 1,
                    max_tokens: 700,
                    stream: true
                })
            }
        );

        // =====================================================
        // 13. RESPUESTA NVIDIA
        // =====================================================

        console.log(
            "📡 NVIDIA respondió:",
            response.status
        );

        if (!response.ok) {

            const errorData =
                await response.text();

            console.error(
                "❌ Error NVIDIA:",
                errorData
            );

            return res.status(
                response.status
            ).json({
                success: false,
                message:
                    errorData ||
                    "Error comunicando con NVIDIA"
            });

        }

        // =====================================================
        // 14. VERIFICAR STREAM
        // =====================================================

        if (!response.body) {

            return res.status(500).json({
                success: false,
                message:
                    "NVIDIA no devolvió un stream"
            });

        }

        // =====================================================
        // 15. CONFIGURAR STREAM
        // =====================================================

        res.status(200);

        res.setHeader(
            "Content-Type",
            "text/plain; charset=utf-8"
        );

        res.setHeader(
            "Cache-Control",
            "no-cache, no-transform"
        );

        res.setHeader(
            "Connection",
            "keep-alive"
        );

        res.flushHeaders();

        // =====================================================
        // 16. LEER STREAM
        // =====================================================

        const reader =
            response.body.getReader();

        const decoder =
            new TextDecoder("utf-8");

        let buffer = "";

        console.log(
            "🟢 Stream iniciado"
        );

        while (true) {

            const {
                done,
                value
            } = await reader.read();

            if (done) {
                break;
            }

            buffer += decoder.decode(
                value,
                {
                    stream: true
                }
            );

            const eventos =
                buffer.split("\n\n");

            buffer =
                eventos.pop() || "";

            for (const evento of eventos) {

                const lineas =
                    evento.split("\n");

                for (const linea of lineas) {

                    const lineaLimpia =
                        linea.trim();

                    if (
                        !lineaLimpia ||
                        !lineaLimpia.startsWith("data:")
                    ) {
                        continue;
                    }

                    const contenido =
                        lineaLimpia
                            .substring(5)
                            .trim();

                    if (
                        contenido === "[DONE]"
                    ) {
                        continue;
                    }

                    try {

                        const json =
                            JSON.parse(
                                contenido
                            );

                        const delta =
                            json
                                ?.choices?.[0]
                                ?.delta;

                        if (!delta) {
                            continue;
                        }

                        if (delta.content) {

                            res.write(
                                delta.content
                            );

                        }

                    } catch (error) {

                        console.log(
                            "⚠️ Evento SSE no procesable"
                        );

                    }

                }

            }

        }

        // =====================================================
        // 17. PROCESAR ÚLTIMO FRAGMENTO
        // =====================================================

        const ultimoChunk =
            decoder.decode();

        if (ultimoChunk) {

            buffer += ultimoChunk;

        }

        if (buffer.trim()) {

            const lineas =
                buffer.split("\n");

            for (const linea of lineas) {

                const lineaLimpia =
                    linea.trim();

                if (
                    !lineaLimpia.startsWith("data:")
                ) {
                    continue;
                }

                const contenido =
                    lineaLimpia
                        .substring(5)
                        .trim();

                if (
                    contenido === "[DONE]"
                ) {
                    continue;
                }

                try {

                    const json =
                        JSON.parse(
                            contenido
                        );

                    const content =
                        json
                            ?.choices?.[0]
                            ?.delta
                            ?.content;

                    if (content) {

                        res.write(
                            content
                        );

                    }

                } catch {
                    // Fragmento incompleto.
                }

            }

        }

        // =====================================================
        // 18. FINALIZAR
        // =====================================================

        console.log(
            "✅ Stream finalizado"
        );

        res.end();

    } catch (error) {

        console.error(
            "❌ Error FitLife IA:",
            error
        );

        if (!res.headersSent) {

            return res.status(500).json({
                success: false,
                message:
                    error.message ||
                    "Error comunicando con NVIDIA"
            });

        }

        res.end();

    }

};


// =========================================================
// EXPORTAR
// =========================================================

module.exports = {
    chatWithAI
};

