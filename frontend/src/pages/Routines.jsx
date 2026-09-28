
import { useEffect, useState } from "react";

function Routines() {
    // =====================================================
    // ESTADOS
    // =====================================================

    const [rutinas, setRutinas] = useState([]);
    const [rutinaSeleccionada, setRutinaSeleccionada] = useState(null);

    const [ejercicios, setEjercicios] = useState([]);
    const [ejerciciosSeleccionados, setEjerciciosSeleccionados] = useState([]);

    const [cargando, setCargando] = useState(true);
    const [cargandoDetalle, setCargandoDetalle] = useState(false);
    const [creando, setCreando] = useState(false);

    const [mostrarFormulario, setMostrarFormulario] = useState(false);

    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");

    const [formulario, setFormulario] = useState({
        nombre: "",
        descripcion: "",
        objetivo: "ganar_musculo",
        nivel: "principiante",
        dias_semana: 3,
        duracion_estimada: 40
    });

    // =====================================================
    // CARGAR DATOS INICIALES
    // =====================================================

    useEffect(() => {
        obtenerRutinas();
        obtenerEjercicios();
    }, []);

    // =====================================================
    // OBTENER RUTINAS
    // =====================================================

    const obtenerRutinas = async () => {
        try {
            setCargando(true);
            setError("");

            const token = localStorage.getItem("token");

            const response = await fetch(
                "http://localhost:3000/api/routines",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "No se pudieron obtener las rutinas"
                );
            }

            setRutinas(data.routines || []);

        } catch (error) {
            console.error(error);
            setError(error.message);
        } finally {
            setCargando(false);
        }
    };

    // =====================================================
    // OBTENER EJERCICIOS
    // =====================================================

    const obtenerEjercicios = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                "http://localhost:3000/api/exercises",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "No se pudieron obtener los ejercicios"
                );
            }

            setEjercicios(data.exercises || []);

        } catch (error) {
            console.error("Error obteniendo ejercicios:", error);
        }
    };

    // =====================================================
    // VER DETALLE DE UNA RUTINA
    // =====================================================

    const verRutina = async (id) => {
        try {
            setCargandoDetalle(true);
            setError("");

            const token = localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:3000/api/routines/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "No se pudo obtener la rutina"
                );
            }

            setRutinaSeleccionada(data.routine);

        } catch (error) {
            console.error(error);
            setError(error.message);
        } finally {
            setCargandoDetalle(false);
        }
    };

    // =====================================================
    // CERRAR DETALLE
    // =====================================================

    const cerrarDetalle = () => {
        setRutinaSeleccionada(null);
    };

    // =====================================================
    // CAMBIAR DATOS DEL FORMULARIO
    // =====================================================

    const manejarCambioFormulario = (e) => {
        const { name, value } = e.target;

        setFormulario((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    // =====================================================
    // SELECCIONAR / DESELECCIONAR EJERCICIO
    // =====================================================

    const seleccionarEjercicio = (ejercicio) => {
        const existe = ejerciciosSeleccionados.some(
            (item) => item.ejercicio_id === ejercicio.id
        );

        if (existe) {
            setEjerciciosSeleccionados((prev) =>
                prev.filter(
                    (item) => item.ejercicio_id !== ejercicio.id
                )
            );

            return;
        }

        setEjerciciosSeleccionados((prev) => [
            ...prev,
            {
                ejercicio_id: ejercicio.id,
                series: 3,
                repeticiones: 10,
                tiempo_segundos: null,
                descanso_segundos: 60,
                notas: ""
            }
        ]);
    };

    // =====================================================
    // CAMBIAR CONFIGURACIÓN DE UN EJERCICIO
    // =====================================================

    const cambiarConfiguracionEjercicio = (
        ejercicioId,
        campo,
        valor
    ) => {
        setEjerciciosSeleccionados((prev) =>
            prev.map((ejercicio) =>
                ejercicio.ejercicio_id === ejercicioId
                    ? {
                        ...ejercicio,
                        [campo]: valor
                    }
                    : ejercicio
            )
        );
    };

    // =====================================================
    // CREAR RUTINA
    // =====================================================

    const crearRutina = async (e) => {
        e.preventDefault();

        try {
            setCreando(true);
            setError("");
            setMensaje("");

            if (!formulario.nombre.trim()) {
                throw new Error("Debes ingresar un nombre para la rutina");
            }

            if (ejerciciosSeleccionados.length === 0) {
                throw new Error(
                    "Debes seleccionar al menos un ejercicio"
                );
            }

            const token = localStorage.getItem("token");

            const response = await fetch(
                "http://localhost:3000/api/routines",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        ...formulario,
                        dias_semana: Number(formulario.dias_semana),
                        duracion_estimada: Number(
                            formulario.duracion_estimada
                        ),
                        exercises: ejerciciosSeleccionados
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "No se pudo crear la rutina"
                );
            }

            setMensaje("Rutina creada correctamente 🎉");

            // Limpiar formulario
            setFormulario({
                nombre: "",
                descripcion: "",
                objetivo: "ganar_musculo",
                nivel: "principiante",
                dias_semana: 3,
                duracion_estimada: 40
            });

            setEjerciciosSeleccionados([]);

            setMostrarFormulario(false);

            // Recargar rutinas
            await obtenerRutinas();

        } catch (error) {
            console.error(error);
            setError(error.message);
        } finally {
            setCreando(false);
        }
    };

    // =====================================================
    // ICONO DEL OBJETIVO
    // =====================================================

    const obtenerIconoObjetivo = (objetivo) => {
        switch (objetivo) {
            case "ganar_musculo":
                return "💪";

            case "perder_peso":
                return "🔥";

            case "mejorar_resistencia":
                return "🏃";

            case "mejorar_salud":
                return "❤️";

            case "mantener":
                return "⚡";

            default:
                return "🏋️";
        }
    };

    // =====================================================
    // NOMBRE DEL OBJETIVO
    // =====================================================

    const obtenerNombreObjetivo = (objetivo) => {
        switch (objetivo) {
            case "ganar_musculo":
                return "Fuerza y músculo";

            case "perder_peso":
                return "Composición corporal";

            case "mejorar_resistencia":
                return "Resistencia";

            case "mejorar_salud":
                return "Salud y bienestar";

            case "mantener":
                return "Mantener condición";

            default:
                return "Entrenamiento";
        }
    };

    // =====================================================
    // ESTADO DE CARGA
    // =====================================================

    if (cargando) {
        return (
            <div className="routines-loading">
                <div className="loading-spinner"></div>

                <p>
                    Cargando tus rutinas...
                </p>
            </div>
        );
    }

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="routines-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="routines-header">

                <div>
                    <span className="section-label">
                        ENTRENAMIENTO
                    </span>

                    <h1>
                        Mis rutinas
                    </h1>

                    <p>
                        Entrena de forma organizada y alcanza
                        tus objetivos.
                    </p>
                </div>

                <div className="routines-header-actions">

                    <button
                        className="create-routine-button"
                        onClick={() => {
                            setMostrarFormulario(true);
                            setError("");
                            setMensaje("");
                        }}
                    >
                        + Nueva rutina
                    </button>

                    <div className="routine-header-icon">
                        🏋️
                    </div>

                </div>

            </div>

            {/* =================================================
                MENSAJES
            ================================================= */}

            {error && (
                <div className="routine-message error">
                    {error}
                </div>
            )}

            {mensaje && (
                <div className="routine-message success">
                    {mensaje}
                </div>
            )}

            {/* =================================================
                LISTADO DE RUTINAS
            ================================================= */}

            {rutinas.length === 0 ? (

                <div className="empty-routines">

                    <div className="empty-routines-icon">
                        🏋️
                    </div>

                    <h2>
                        Todavía no tienes rutinas
                    </h2>

                    <p>
                        Crea tu primera rutina personalizada
                        para comenzar a entrenar.
                    </p>

                    <button
                        className="primary-button"
                        onClick={() => {
                            setMostrarFormulario(true);
                            setError("");
                        }}
                    >
                        Crear mi primera rutina
                    </button>

                </div>

            ) : (

                <div className="routines-grid">

                    {rutinas.map((rutina) => (

                        <article
                            className="routine-card"
                            key={rutina.id}
                        >

                            <div className="routine-card-top">

                                <div className="routine-icon">
                                    {obtenerIconoObjetivo(
                                        rutina.objetivo
                                    )}
                                </div>

                                <span
                                    className={
                                        rutina.activa
                                            ? "routine-status active"
                                            : "routine-status"
                                    }
                                >
                                    {rutina.activa
                                        ? "Activa"
                                        : "Inactiva"}
                                </span>

                            </div>

                            <h2>
                                {rutina.nombre}
                            </h2>

                            <p className="routine-description">
                                {rutina.descripcion ||
                                    "Rutina personalizada de FitLife."}
                            </p>

                            <div className="routine-tags">

                                <span>
                                    🎯{" "}
                                    {obtenerNombreObjetivo(
                                        rutina.objetivo
                                    )}
                                </span>

                                <span>
                                    📊 {rutina.nivel}
                                </span>

                            </div>

                            <div className="routine-stats">

                                <div>
                                    <strong>
                                        {rutina.dias_semana}
                                    </strong>

                                    <span>
                                        días/semana
                                    </span>
                                </div>

                                <div>
                                    <strong>
                                        {rutina.duracion_estimada || "--"}
                                    </strong>

                                    <span>
                                        minutos
                                    </span>
                                </div>

                            </div>

                            <button
                                className="routine-button"
                                onClick={() =>
                                    verRutina(rutina.id)
                                }
                            >
                                Ver rutina

                                <span>
                                    →
                                </span>
                            </button>

                        </article>

                    ))}

                </div>

            )}

            {/* =================================================
                MODAL CREAR RUTINA
            ================================================= */}

            {mostrarFormulario && (

                <div className="routine-overlay">

                    <div className="routine-modal create-routine-modal">

                        <button
                            className="routine-close"
                            onClick={() => setMostrarFormulario(false)}
                        >
                            ×
                        </button>

                        <div className="routine-modal-header">

                            <div className="routine-icon large">
                                🏋️
                            </div>

                            <div>

                                <span className="section-label">
                                    FITLIFE
                                </span>

                                <h2>
                                    Crear nueva rutina
                                </h2>

                                <p>
                                    Personaliza tu entrenamiento.
                                </p>

                            </div>

                        </div>

                        <form onSubmit={crearRutina}>

                            {/* INFORMACIÓN GENERAL */}

                            <div className="routine-form-section">

                                <h3>
                                    Información general
                                </h3>

                                <div className="form-group">

                                    <label>
                                        Nombre de la rutina
                                    </label>

                                    <input
                                        type="text"
                                        name="nombre"
                                        value={formulario.nombre}
                                        onChange={manejarCambioFormulario}
                                        placeholder="Ej: Rutina de fuerza"
                                        required
                                    />

                                </div>

                                <div className="form-group">

                                    <label>
                                        Descripción
                                    </label>

                                    <textarea
                                        name="descripcion"
                                        value={formulario.descripcion}
                                        onChange={manejarCambioFormulario}
                                        placeholder="Describe tu rutina..."
                                        rows="3"
                                    />

                                </div>

                                <div className="routine-form-grid">

                                    <div className="form-group">

                                        <label>
                                            Objetivo
                                        </label>

                                        <select
                                            name="objetivo"
                                            value={formulario.objetivo}
                                            onChange={manejarCambioFormulario}
                                        >

                                            <option value="ganar_musculo">
                                                💪 Ganar músculo
                                            </option>

                                            <option value="perder_peso">
                                                🔥 Composición corporal
                                            </option>

                                            <option value="mejorar_resistencia">
                                                🏃 Mejorar resistencia
                                            </option>

                                            <option value="mejorar_salud">
                                                ❤️ Mejorar salud
                                            </option>

                                            <option value="mantener">
                                                ⚡ Mantener condición
                                            </option>

                                        </select>

                                    </div>

                                    <div className="form-group">

                                        <label>
                                            Nivel
                                        </label>

                                        <select
                                            name="nivel"
                                            value={formulario.nivel}
                                            onChange={manejarCambioFormulario}
                                        >

                                            <option value="principiante">
                                                Principiante
                                            </option>

                                            <option value="intermedio">
                                                Intermedio
                                            </option>

                                            <option value="avanzado">
                                                Avanzado
                                            </option>

                                        </select>

                                    </div>

                                </div>

                                <div className="routine-form-grid">

                                    <div className="form-group">

                                        <label>
                                            Días por semana
                                        </label>

                                        <input
                                            type="number"
                                            name="dias_semana"
                                            min="1"
                                            max="7"
                                            value={formulario.dias_semana}
                                            onChange={manejarCambioFormulario}
                                        />

                                    </div>

                                    <div className="form-group">

                                        <label>
                                            Duración aproximada
                                        </label>

                                        <input
                                            type="number"
                                            name="duracion_estimada"
                                            min="5"
                                            max="300"
                                            value={formulario.duracion_estimada}
                                            onChange={manejarCambioFormulario}
                                        />

                                        <small>
                                            Minutos
                                        </small>

                                    </div>

                                </div>

                            </div>

                            {/* EJERCICIOS */}

                            <div className="routine-form-section">

                                <div className="exercise-selector-header">

                                    <div>
                                        <h3>
                                            Ejercicios
                                        </h3>

                                        <p>
                                            Selecciona los ejercicios
                                            que formarán parte de tu rutina.
                                        </p>
                                    </div>

                                    <span>
                                        {ejerciciosSeleccionados.length} seleccionados
                                    </span>

                                </div>

                                {ejercicios.length === 0 ? (

                                    <div className="exercise-empty">

                                        <div>
                                            🏋️
                                        </div>

                                        <p>
                                            No hay ejercicios disponibles.
                                        </p>

                                        <small>
                                            Primero debemos cargar los ejercicios
                                            en FitLife.
                                        </small>

                                    </div>

                                ) : (

                                    <div className="exercise-selector">

                                        {ejercicios.map((ejercicio) => {

                                            const seleccionado =
                                                ejerciciosSeleccionados.some(
                                                    (item) =>
                                                        item.ejercicio_id ===
                                                        ejercicio.id
                                                );

                                            return (

                                                <div
                                                    key={ejercicio.id}
                                                    className={
                                                        seleccionado
                                                            ? "exercise-selector-item selected"
                                                            : "exercise-selector-item"
                                                    }
                                                >

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            seleccionarEjercicio(
                                                                ejercicio
                                                            )
                                                        }
                                                        className="exercise-select-button"
                                                    >

                                                        <div className="exercise-selector-icon">
                                                            🏋️
                                                        </div>

                                                        <div className="exercise-selector-info">

                                                            <strong>
                                                                {ejercicio.nombre}
                                                            </strong>

                                                            <span>
                                                                {ejercicio.grupo_muscular ||
                                                                    "Entrenamiento general"}
                                                            </span>

                                                        </div>

                                                        <div className="exercise-check">

                                                            {seleccionado
                                                                ? "✓"
                                                                : "+"}

                                                        </div>

                                                    </button>

                                                    {/* CONFIGURACIÓN */}

                                                    {seleccionado && (

                                                        <div className="exercise-config">

                                                            <div className="exercise-config-field">

                                                                <label>
                                                                    Series
                                                                </label>

                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    max="20"
                                                                    value={
                                                                        ejerciciosSeleccionados.find(
                                                                            (item) =>
                                                                                item.ejercicio_id ===
                                                                                ejercicio.id
                                                                        )?.series || 3
                                                                    }
                                                                    onChange={(e) =>
                                                                        cambiarConfiguracionEjercicio(
                                                                            ejercicio.id,
                                                                            "series",
                                                                            Number(e.target.value)
                                                                        )
                                                                    }
                                                                />

                                                            </div>

                                                            <div className="exercise-config-field">

                                                                <label>
                                                                    Repeticiones
                                                                </label>

                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    max="100"
                                                                    value={
                                                                        ejerciciosSeleccionados.find(
                                                                            (item) =>
                                                                                item.ejercicio_id ===
                                                                                ejercicio.id
                                                                        )?.repeticiones || 10
                                                                    }
                                                                    onChange={(e) =>
                                                                        cambiarConfiguracionEjercicio(
                                                                            ejercicio.id,
                                                                            "repeticiones",
                                                                            Number(e.target.value)
                                                                        )
                                                                    }
                                                                />

                                                            </div>

                                                            <div className="exercise-config-field">

                                                                <label>
                                                                    Descanso
                                                                </label>

                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    max="600"
                                                                    value={
                                                                        ejerciciosSeleccionados.find(
                                                                            (item) =>
                                                                                item.ejercicio_id ===
                                                                                ejercicio.id
                                                                        )?.descanso_segundos || 60
                                                                    }
                                                                    onChange={(e) =>
                                                                        cambiarConfiguracionEjercicio(
                                                                            ejercicio.id,
                                                                            "descanso_segundos",
                                                                            Number(e.target.value)
                                                                        )
                                                                    }
                                                                />

                                                                <small>
                                                                    segundos
                                                                </small>

                                                            </div>

                                                        </div>

                                                    )}

                                                </div>

                                            );

                                        })}

                                    </div>

                                )}

                            </div>

                            {/* BOTONES */}

                            <div className="create-routine-actions">

                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={() =>
                                        setMostrarFormulario(false)
                                    }
                                    disabled={creando}
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    className="primary-button"
                                    disabled={
                                        creando ||
                                        ejerciciosSeleccionados.length === 0
                                    }
                                >

                                    {creando
                                        ? "Creando..."
                                        : "Crear rutina 🚀"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

            {/* =================================================
                MODAL DETALLE
            ================================================= */}

            {rutinaSeleccionada && (

                <div className="routine-overlay">

                    <div className="routine-modal">

                        <button
                            className="routine-close"
                            onClick={cerrarDetalle}
                        >
                            ×
                        </button>

                        {cargandoDetalle ? (

                            <div className="routine-detail-loading">

                                <div className="loading-spinner"></div>

                                <p>
                                    Cargando rutina...
                                </p>

                            </div>

                        ) : (

                            <>

                                <div className="routine-modal-header">

                                    <div className="routine-icon large">

                                        {obtenerIconoObjetivo(
                                            rutinaSeleccionada.objetivo
                                        )}

                                    </div>

                                    <div>

                                        <span className="section-label">
                                            RUTINA
                                        </span>

                                        <h2>
                                            {rutinaSeleccionada.nombre}
                                        </h2>

                                        <p>
                                            {rutinaSeleccionada.descripcion}
                                        </p>

                                    </div>

                                </div>

                                <div className="routine-detail-stats">

                                    <div>

                                        <span>
                                            Objetivo
                                        </span>

                                        <strong>
                                            {obtenerNombreObjetivo(
                                                rutinaSeleccionada.objetivo
                                            )}
                                        </strong>

                                    </div>

                                    <div>

                                        <span>
                                            Nivel
                                        </span>

                                        <strong>
                                            {rutinaSeleccionada.nivel}
                                        </strong>

                                    </div>

                                    <div>

                                        <span>
                                            Duración
                                        </span>

                                        <strong>
                                            {rutinaSeleccionada.duracion_estimada || "--"} min
                                        </strong>

                                    </div>

                                </div>

                                <div className="exercise-list">

                                    <h3>
                                        Ejercicios
                                    </h3>

                                    {rutinaSeleccionada.exercises?.length > 0 ? (

                                        rutinaSeleccionada.exercises.map(
                                            (ejercicio) => (

                                                <div
                                                    className="exercise-item"
                                                    key={ejercicio.id}
                                                >

                                                    <div className="exercise-number">
                                                        {ejercicio.orden}
                                                    </div>

                                                    <div className="exercise-info">

                                                        <h4>
                                                            {ejercicio.nombre}
                                                        </h4>

                                                        <span>
                                                            {ejercicio.grupo_muscular}
                                                        </span>

                                                    </div>

                                                    <div className="exercise-data">

                                                        <strong>
                                                            {ejercicio.series} ×{" "}
                                                            {ejercicio.repeticiones ||
                                                                `${ejercicio.tiempo_segundos}s`}
                                                        </strong>

                                                        <span>
                                                            Descanso{" "}
                                                            {ejercicio.descanso_segundos}s
                                                        </span>

                                                    </div>

                                                    {Boolean(
                                                        ejercicio.mediapipe_compatible
                                                    ) && (

                                                        <div
                                                            className="mediapipe-badge"
                                                            title="Compatible con MediaPipe"
                                                        >
                                                            📷
                                                        </div>

                                                    )}

                                                </div>

                                            )
                                        )

                                    ) : (

                                        <p>
                                            Esta rutina todavía no tiene ejercicios.
                                        </p>

                                    )}

                                </div>

                                <button
                                    className="start-routine-button"
                                    onClick={() =>
                                        alert(
                                            "Aquí iniciaremos el entrenamiento con MediaPipe 🚀"
                                        )
                                    }
                                >
                                    Comenzar entrenamiento

                                    <span>
                                        →
                                    </span>

                                </button>

                            </>

                        )}

                    </div>

                </div>

            )}

        </div>
    );
}

export default Routines;

