
import { useState } from "react";
import "./FitLifeAI.css";

function FitLifeAI() {

    const [mensaje, setMensaje] = useState("");
    const [mensajes, setMensajes] = useState([]);
    const [cargando, setCargando] = useState(false);

    const sugerencias = [
        {
            icono: "🏋️",
            titulo: "Crear una rutina",
            texto: "Quiero una rutina de entrenamiento"
        },
        {
            icono: "🥗",
            titulo: "Crear alimentación",
            texto: "Quiero un plan de alimentación"
        },
        {
            icono: "🎯",
            titulo: "Definir objetivos",
            texto: "Ayúdame con mis objetivos"
        },
        {
            icono: "💡",
            titulo: "Consejos",
            texto: "Dame consejos para mejorar mis hábitos"
        }
    ];

    const enviarMensaje = async (
        e,
        textoPersonalizado = null
    ) => {

        if (e) {
            e.preventDefault();
        }

        const texto =
            textoPersonalizado || mensaje;

        if (!texto.trim() || cargando) {
            return;
        }

        const userMessage = {
            id: Date.now(),
            role: "user",
            content: texto
        };

        setMensajes((prev) => [
            ...prev,
            userMessage
        ]);

        setMensaje("");
        setCargando(true);

        try {

            const token =
                localStorage.getItem("token");

            if (!token) {
                throw new Error(
                    "No hay una sesión activa"
                );
            }

            const response = await fetch(
                "http://localhost:3000/api/ai/chat-stream",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        message: texto
                    })
                }
            );

            if (!response.ok) {

                let errorMessage =
                    "Error comunicando con FitLife IA";

                try {

                    const errorData =
                        await response.json();

                    errorMessage =
                        errorData.message ||
                        errorMessage;

                } catch {
                    // No se pudo leer JSON
                }

                throw new Error(errorMessage);
            }

            if (!response.body) {
                throw new Error(
                    "El servidor no soporta streaming"
                );
            }

            const assistantId =
                Date.now() + 1;

            setMensajes((prev) => [
                ...prev,
                {
                    id: assistantId,
                    role: "assistant",
                    content: ""
                }
            ]);

            const reader =
                response.body.getReader();

            const decoder =
                new TextDecoder("utf-8");

            let respuestaCompleta = "";

            while (true) {

                const {
                    done,
                    value
                } = await reader.read();

                if (done) {
                    break;
                }

                const textoChunk =
                    decoder.decode(
                        value,
                        {
                            stream: true
                        }
                    );

                respuestaCompleta +=
                    textoChunk;

                setMensajes((prev) =>
                    prev.map((item) =>
                        item.id === assistantId
                            ? {
                                ...item,
                                content:
                                    respuestaCompleta
                            }
                            : item
                    )
                );
            }

            const ultimoChunk =
                decoder.decode();

            if (ultimoChunk) {

                respuestaCompleta +=
                    ultimoChunk;

                setMensajes((prev) =>
                    prev.map((item) =>
                        item.id === assistantId
                            ? {
                                ...item,
                                content:
                                    respuestaCompleta
                            }
                            : item
                    )
                );
            }

        } catch (error) {

            console.error(
                "Error FitLife IA:",
                error
            );

            setMensajes((prev) => [
                ...prev,
                {
                    id: Date.now() + 2,
                    role: "assistant",
                    content:
                        `⚠️ ${error.message}`
                }
            ]);

        } finally {

            setCargando(false);

        }
    };

    const seleccionarSugerencia = (
        texto
    ) => {

        enviarMensaje(
            null,
            texto
        );

    };

    return (

        <div className="fitlife-ai-page">

            {/* =====================================
                HERO
            ====================================== */}

            <section className="ai-hero">

                <div className="ai-hero-content">

                    <div className="ai-badge">
                        <span>✦</span>
                        FITLIFE IA
                    </div>

                    <h1>
                        Tu asistente inteligente
                    </h1>

                    <p>
                        Entrenamiento, nutrición y hábitos.
                        Todo en un solo lugar, pensado para
                        acompañarte en tu proceso.
                    </p>

                </div>

                <div className="ai-hero-icon">
                    🤖
                </div>

            </section>


            {/* =====================================
                CHAT
            ====================================== */}

            <section className="ai-chat-card">

                {/* =================================
                    MENSAJE DE BIENVENIDA
                ================================== */}

                {mensajes.length === 0 && (

                    <div className="ai-welcome">

                        <div className="ai-avatar">
                            🤖
                        </div>

                        <div className="ai-welcome-content">

                            <span className="ai-small-label">
                                FITLIFE IA
                            </span>

                            <h2>
                                ¡Hola! 👋
                            </h2>

                            <p>
                                Soy tu asistente de FitLife.
                                Puedo ayudarte a organizar tus
                                entrenamientos, alimentación y
                                objetivos.
                            </p>

                        </div>

                    </div>

                )}


                {/* =================================
                    MENSAJES
                ================================== */}

                {mensajes.length > 0 && (

                    <div className="ai-messages">

                        {mensajes.map(
                            (item) => (

                                <div
                                    key={item.id}
                                    className={
                                        item.role === "user"
                                            ? "ai-message user-message"
                                            : "ai-message assistant-message"
                                    }
                                >

                                    <div className="message-avatar">

                                        {item.role === "user"
                                            ? "👤"
                                            : "🤖"}

                                    </div>

                                    <div className="message-content">

                                        <span className="message-author">

                                            {item.role === "user"
                                                ? "Tú"
                                                : "FitLife IA"}

                                        </span>

                                        <p>
                                            {item.content || "..."}
                                        </p>

                                    </div>

                                </div>

                            )
                        )}


                        {/* =================================
                            ANIMACIÓN DE PENSAMIENTO
                        ================================== */}

                        {cargando && (

                            <div className="ai-message assistant-message">

                                <div className="message-avatar">
                                    🤖
                                </div>

                                <div className="message-content">

                                    <span className="message-author">
                                        FitLife IA
                                    </span>

                                    <div className="ai-thinking">

                                        <span className="thinking-text">
                                            FitLife IA está pensando
                                        </span>

                                        <span className="thinking-dots">

                                            <span></span>
                                            <span></span>
                                            <span></span>

                                        </span>

                                    </div>

                                </div>

                            </div>

                        )}

                    </div>

                )}


                {/* =================================
                    SUGERENCIAS
                ================================== */}

                {mensajes.length === 0 && (

                    <div className="ai-suggestions">

                        <div className="ai-suggestions-header">

                            <span>
                                ¿QUÉ NECESITAS?
                            </span>

                            <p>
                                Elige una opción para comenzar
                            </p>

                        </div>


                        <div className="suggestions-grid">

                            {sugerencias.map(
                                (sugerencia) => (

                                    <button
                                        key={
                                            sugerencia.titulo
                                        }
                                        className="suggestion-card"
                                        onClick={() =>
                                            seleccionarSugerencia(
                                                sugerencia.texto
                                            )
                                        }
                                    >

                                        <span className="suggestion-icon">
                                            {sugerencia.icono}
                                        </span>

                                        <div>

                                            <strong>
                                                {sugerencia.titulo}
                                            </strong>

                                            <small>
                                                {sugerencia.texto}
                                            </small>

                                        </div>

                                        <span className="suggestion-arrow">
                                            →
                                        </span>

                                    </button>

                                )
                            )}

                        </div>

                    </div>

                )}


                {/* =================================
                    INPUT
                ================================== */}

                <form
                    className="ai-input-container"
                    onSubmit={enviarMensaje}
                >

                    <div className="ai-input-icon">
                        ✦
                    </div>

                    <input
                        type="text"
                        placeholder="Escribe lo que necesitas..."
                        value={mensaje}
                        onChange={(e) =>
                            setMensaje(
                                e.target.value
                            )
                        }
                        disabled={cargando}
                    />

                    <button
                        type="submit"
                        className="ai-send-button"
                        disabled={
                            !mensaje.trim() ||
                            cargando
                        }
                    >
                        ➤
                    </button>

                </form>


                {/* =================================
                    DISCLAIMER
                ================================== */}

                <div className="ai-disclaimer">

                    <span>
                        ✦
                    </span>

                    <p>
                        FitLife IA proporciona orientación
                        general. No sustituye la valoración
                        de profesionales cualificados.
                    </p>

                </div>

            </section>

        </div>
    );
}

export default FitLifeAI;

