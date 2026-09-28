
import { useEffect, useState } from "react";
import "./Nutrition.css";

function Nutrition() {
    const [planes, setPlanes] = useState([]);
    const [planSeleccionado, setPlanSeleccionado] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        obtenerNutricion();
    }, []);

    const obtenerNutricion = async () => {
        try {
            setCargando(true);
            setError("");

            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error("No hay una sesión activa");
            }

            const response = await fetch(
                "http://localhost:3000/api/nutrition",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "No se pudo obtener la información nutricional"
                );
            }

            setPlanes(data.plans || []);

            if (data.plans && data.plans.length > 0) {
                setPlanSeleccionado(data.plans[0]);
            }

        } catch (error) {
            console.error("Error nutrición:", error);
            setError(error.message);
        } finally {
            setCargando(false);
        }
    };

    // ==========================================
    // ICONOS DE LAS COMIDAS
    // ==========================================

    const obtenerIconoComida = (tipo) => {
        switch (tipo) {
            case "desayuno":
                return "🌅";

            case "almuerzo":
                return "🍽️";

            case "cena":
                return "🌙";

            case "snack":
                return "🍎";

            default:
                return "🥗";
        }
    };

    // ==========================================
    // NOMBRES DE LAS COMIDAS
    // ==========================================

    const obtenerNombreComida = (tipo) => {
        switch (tipo) {
            case "desayuno":
                return "Desayuno";

            case "almuerzo":
                return "Almuerzo";

            case "cena":
                return "Cena";

            case "snack":
                return "Snack";

            default:
                return "Comida";
        }
    };

    // ==========================================
    // AGRUPAR COMIDAS
    // ==========================================

    const agruparComidas = () => {
        if (!planSeleccionado?.comidas) {
            return {};
        }

        return planSeleccionado.comidas.reduce((grupos, comida) => {
            if (!grupos[comida.tipo_comida]) {
                grupos[comida.tipo_comida] = [];
            }

            grupos[comida.tipo_comida].push(comida);

            return grupos;
        }, {});
    };

    // ==========================================
    // CALCULAR TOTALES DE MACRONUTRIENTES
    // ==========================================

    const calcularTotales = () => {
        if (!planSeleccionado?.comidas) {
            return {
                calorias: 0,
                proteinas: 0,
                carbohidratos: 0,
                grasas: 0
            };
        }

        return planSeleccionado.comidas.reduce(
            (totales, comida) => {
                totales.calorias += Number(comida.calorias) || 0;
                totales.proteinas += Number(comida.proteinas) || 0;
                totales.carbohidratos +=
                    Number(comida.carbohidratos) || 0;
                totales.grasas += Number(comida.grasas) || 0;

                return totales;
            },
            {
                calorias: 0,
                proteinas: 0,
                carbohidratos: 0,
                grasas: 0
            }
        );
    };

    const totales = calcularTotales();

    // ==========================================
    // FORMATEAR NÚMEROS
    // ==========================================

    const formatearNumero = (numero) => {
        return Number.isInteger(numero)
            ? numero
            : numero.toFixed(2);
    };

    // ==========================================
    // CARGANDO
    // ==========================================

    if (cargando) {
        return (
            <div className="nutrition-loading">
                <div className="loading-spinner"></div>

                <p>
                    Cargando tu alimentación...
                </p>
            </div>
        );
    }

    // ==========================================
    // INTERFAZ
    // ==========================================

    return (
        <div className="nutrition-page">

            {/* ==================================
                ENCABEZADO
            ================================== */}

            <div className="nutrition-header">

                <div>

                    <span className="section-label">
                        NUTRICIÓN
                    </span>

                    <h1>
                        Mi alimentación
                    </h1>

                    <p>
                        Organiza tu alimentación y acompaña
                        tus entrenamientos con buenos hábitos.
                    </p>

                </div>

                <div className="nutrition-header-icon">
                    🥗
                </div>

            </div>


            {/* ==================================
                ERROR
            ================================== */}

            {error && (
                <div className="nutrition-message error">
                    {error}
                </div>
            )}


            {/* ==================================
                SIN PLANES
            ================================== */}

            {planes.length === 0 ? (

                <div className="empty-nutrition">

                    <div className="empty-nutrition-icon">
                        🥗
                    </div>

                    <h2>
                        Todavía no tienes un plan nutricional
                    </h2>

                    <p>
                        Cuando tengas un plan de alimentación
                        asignado, aparecerá aquí.
                    </p>

                    <div className="nutrition-disclaimer">

                        <strong>
                            ⚠️ Importante
                        </strong>

                        <p>
                            La información nutricional de FitLife
                            es orientativa y no sustituye la
                            valoración de un profesional de la salud.
                        </p>

                    </div>

                </div>

            ) : (

                <>

                    {/* ==================================
                        SELECTOR DE PLAN
                    ================================== */}

                    {planes.length > 1 && (

                        <div className="nutrition-plan-selector">

                            <label>
                                Plan de alimentación
                            </label>

                            <select
                                value={planSeleccionado?.id || ""}
                                onChange={(e) => {

                                    const plan = planes.find(
                                        (item) =>
                                            item.id ===
                                            Number(e.target.value)
                                    );

                                    setPlanSeleccionado(plan);
                                }}
                            >

                                {planes.map((plan) => (

                                    <option
                                        key={plan.id}
                                        value={plan.id}
                                    >
                                        {plan.nombre_plan}
                                    </option>

                                ))}

                            </select>

                        </div>
                    )}


                    {planSeleccionado && (

                        <>

                            {/* ==================================
                                PLAN ACTUAL
                            ================================== */}

                            <section className="nutrition-plan-card">

                                <div className="nutrition-plan-icon">
                                    🥗
                                </div>

                                <div className="nutrition-plan-info">

                                    <span className="section-label">
                                        PLAN ACTUAL
                                    </span>

                                    <h2>
                                        {planSeleccionado.nombre_plan}
                                    </h2>

                                    <p>
                                        {planSeleccionado.descripcion ||
                                            "Plan de alimentación personalizado para acompañar tus objetivos."}
                                    </p>

                                    <div className="nutrition-plan-tags">

                                        <span>
                                            🎯{" "}
                                            {planSeleccionado.tipo_dieta ||
                                                "Alimentación equilibrada"}
                                        </span>

                                    </div>

                                </div>

                            </section>


                            {/* ==================================
                                ESTADÍSTICAS
                            ================================== */}

                            <section className="nutrition-stats">

                                {/* CALORÍAS */}

                                <div className="nutrition-stat">

                                    <span className="nutrition-stat-icon">
                                        🔥
                                    </span>

                                    <div>

                                        <strong>
                                            {planSeleccionado.calorias_diarias ||
                                                "--"}
                                        </strong>

                                        <span>
                                            kcal diarias
                                        </span>

                                    </div>

                                </div>


                                {/* PROTEÍNAS */}

                                <div className="nutrition-stat">

                                    <span className="nutrition-stat-icon">
                                        🍗
                                    </span>

                                    <div>

                                        <strong>
                                            {formatearNumero(
                                                totales.proteinas
                                            )}
                                            g
                                        </strong>

                                        <span>
                                            proteína
                                        </span>

                                    </div>

                                </div>


                                {/* CARBOHIDRATOS */}

                                <div className="nutrition-stat">

                                    <span className="nutrition-stat-icon">
                                        🍚
                                    </span>

                                    <div>

                                        <strong>
                                            {formatearNumero(
                                                totales.carbohidratos
                                            )}
                                            g
                                        </strong>

                                        <span>
                                            carbohidratos
                                        </span>

                                    </div>

                                </div>


                                {/* GRASAS */}

                                <div className="nutrition-stat">

                                    <span className="nutrition-stat-icon">
                                        🥑
                                    </span>

                                    <div>

                                        <strong>
                                            {formatearNumero(
                                                totales.grasas
                                            )}
                                            g
                                        </strong>

                                        <span>
                                            grasas
                                        </span>

                                    </div>

                                </div>

                            </section>


                            {/* ==================================
                                COMIDAS
                            ================================== */}

                            <section className="meals-section">

                                <div className="meals-section-header">

                                    <div>

                                        <span className="section-label">
                                            ALIMENTACIÓN
                                        </span>

                                        <h2>
                                            Comidas del día
                                        </h2>

                                    </div>

                                    <span className="meals-icon">
                                        🍽️
                                    </span>

                                </div>


                                <div className="meals-list">

                                    {Object.entries(
                                        agruparComidas()
                                    ).map(
                                        ([tipo, comidas]) => (

                                            <div
                                                className="meal-group"
                                                key={tipo}
                                            >

                                                <div className="meal-group-header">

                                                    <div className="meal-type-icon">
                                                        {obtenerIconoComida(
                                                            tipo
                                                        )}
                                                    </div>

                                                    <h3>
                                                        {obtenerNombreComida(
                                                            tipo
                                                        )}
                                                    </h3>

                                                </div>


                                                {comidas.map(
                                                    (comida) => (

                                                        <article
                                                            className="meal-card"
                                                            key={comida.id}
                                                        >

                                                            <div className="meal-card-content">

                                                                <h4>
                                                                    {comida.nombre_comida}
                                                                </h4>

                                                                <p>
                                                                    {comida.descripcion ||
                                                                        "Comida recomendada dentro de tu plan."}
                                                                </p>

                                                            </div>


                                                            <div className="meal-nutrition">

                                                                <div>

                                                                    <strong>
                                                                        {comida.calorias ||
                                                                            "--"}
                                                                    </strong>

                                                                    <span>
                                                                        kcal
                                                                    </span>

                                                                </div>


                                                                <div>

                                                                    <strong>
                                                                        {comida.proteinas ||
                                                                            "--"}
                                                                        g
                                                                    </strong>

                                                                    <span>
                                                                        proteína
                                                                    </span>

                                                                </div>


                                                                <div>

                                                                    <strong>
                                                                        {comida.carbohidratos ||
                                                                            "--"}
                                                                        g
                                                                    </strong>

                                                                    <span>
                                                                        carbs
                                                                    </span>

                                                                </div>


                                                                <div>

                                                                    <strong>
                                                                        {comida.grasas ||
                                                                            "--"}
                                                                        g
                                                                    </strong>

                                                                    <span>
                                                                        grasas
                                                                    </span>

                                                                </div>

                                                            </div>

                                                        </article>

                                                    )
                                                )}

                                            </div>

                                        )
                                    )}

                                </div>

                            </section>


                            {/* ==================================
                                RESUMEN NUTRICIONAL
                            ================================== */}

                            <section className="nutrition-summary">

                                <div className="nutrition-summary-header">

                                    <div>

                                        <span className="section-label">
                                            RESUMEN
                                        </span>

                                        <h2>
                                            Totales del plan
                                        </h2>

                                    </div>

                                    <span className="nutrition-summary-icon">
                                        📊
                                    </span>

                                </div>


                                <div className="nutrition-summary-grid">

                                    <div className="nutrition-summary-item">

                                        <span>
                                            🔥
                                        </span>

                                        <div>

                                            <strong>
                                                {formatearNumero(
                                                    totales.calorias
                                                )}
                                            </strong>

                                            <small>
                                                kcal en comidas
                                            </small>

                                        </div>

                                    </div>


                                    <div className="nutrition-summary-item">

                                        <span>
                                            🍗
                                        </span>

                                        <div>

                                            <strong>
                                                {formatearNumero(
                                                    totales.proteinas
                                                )}
                                                g
                                            </strong>

                                            <small>
                                                proteína
                                            </small>

                                        </div>

                                    </div>


                                    <div className="nutrition-summary-item">

                                        <span>
                                            🍚
                                        </span>

                                        <div>

                                            <strong>
                                                {formatearNumero(
                                                    totales.carbohidratos
                                                )}
                                                g
                                            </strong>

                                            <small>
                                                carbohidratos
                                            </small>

                                        </div>

                                    </div>


                                    <div className="nutrition-summary-item">

                                        <span>
                                            🥑
                                        </span>

                                        <div>

                                            <strong>
                                                {formatearNumero(
                                                    totales.grasas
                                                )}
                                                g
                                            </strong>

                                            <small>
                                                grasas
                                            </small>

                                        </div>

                                    </div>

                                </div>

                            </section>


                            {/* ==================================
                                AVISO
                            ================================== */}

                            <section className="nutrition-disclaimer">

                                <div className="disclaimer-icon">
                                    ⚠️
                                </div>

                                <div>

                                    <h3>
                                        Exención de responsabilidad
                                    </h3>

                                    <p>
                                        La información presentada por FitLife
                                        tiene fines educativos y orientativos.
                                        No constituye asesoramiento médico,
                                        nutricional ni profesional. Las
                                        necesidades alimentarias pueden variar
                                        según cada persona. Si tienes una
                                        condición médica o necesidades
                                        nutricionales específicas, consulta
                                        con un profesional cualificado.
                                    </p>

                                </div>

                            </section>

                        </>

                    )}

                </>

            )}

        </div>
    );
}

export default Nutrition;

