
import { useEffect, useState } from "react";

function Profile() {
    const [perfil, setPerfil] = useState({
        edad: "",
        sexo: "",
        altura: "",
        peso: "",
        objetivo: "",
        nivel_actividad: ""
    });

    const [usuario, setUsuario] = useState({
        nombre: "",
        email: ""
    });

    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        obtenerPerfil();
    }, []);

    const obtenerPerfil = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                "http://localhost:3000/api/profile",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "No se pudo obtener el perfil"
                );
            }

            const profile = data.profile;

            setUsuario({
                nombre: profile.nombre || "",
                email: profile.email || ""
            });

            setPerfil({
                edad: profile.edad ?? "",
                sexo: profile.sexo ?? "",
                altura: profile.altura ?? "",
                peso: profile.peso ?? "",
                objetivo: profile.objetivo ?? "",
                nivel_actividad: profile.nivel_actividad ?? ""
            });

        } catch (error) {
            console.error(error);
            setError(error.message);
        } finally {
            setCargando(false);
        }
    };

    const handleChange = (e) => {
        setPerfil({
            ...perfil,
            [e.target.name]: e.target.value
        });

        setMensaje("");
        setError("");
    };

    const guardarPerfil = async (e) => {
        e.preventDefault();

        setGuardando(true);
        setMensaje("");
        setError("");

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                "http://localhost:3000/api/profile",
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(perfil)
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "No se pudo guardar el perfil"
                );
            }

            setMensaje(data.message);

        } catch (error) {
            console.error(error);
            setError(error.message);
        } finally {
            setGuardando(false);
        }
    };

    if (cargando) {
        return (
            <div className="profile-loading">
                <div className="loading-spinner"></div>
                <p>Cargando tu perfil...</p>
            </div>
        );
    }

    return (
        <div className="profile-page">

            <div className="profile-title">

                <div>
                    <span>MI PERFIL</span>

                    <h1>
                        Tu información
                    </h1>

                    <p>
                        Completa tus datos para personalizar
                        tu experiencia en FitLife.
                    </p>
                </div>

                <div className="profile-avatar">
                    {usuario.nombre
                        .charAt(0)
                        .toUpperCase()}
                </div>

            </div>


            <form
                className="profile-form"
                onSubmit={guardarPerfil}
            >

                {/* Información de cuenta */}

                <section className="profile-card">

                    <div className="profile-card-header">

                        <div className="profile-card-icon">
                            👤
                        </div>

                        <div>
                            <h2>
                                Información de cuenta
                            </h2>

                            <p>
                                Datos asociados a tu cuenta.
                            </p>
                        </div>

                    </div>

                    <div className="account-info">

                        <div>
                            <span>Nombre</span>
                            <strong>
                                {usuario.nombre}
                            </strong>
                        </div>

                        <div>
                            <span>Correo electrónico</span>
                            <strong>
                                {usuario.email}
                            </strong>
                        </div>

                    </div>

                </section>


                {/* Datos físicos */}

                <section className="profile-card">

                    <div className="profile-card-header">

                        <div className="profile-card-icon">
                            📏
                        </div>

                        <div>
                            <h2>
                                Datos físicos
                            </h2>

                            <p>
                                Esta información ayudará a
                                personalizar tus recomendaciones.
                            </p>
                        </div>

                    </div>


                    <div className="profile-fields">

                        <div className="profile-field">

                            <label>
                                Edad
                            </label>

                            <input
                                type="number"
                                name="edad"
                                min="1"
                                max="120"
                                placeholder="Ej. 20"
                                value={perfil.edad}
                                onChange={handleChange}
                            />

                        </div>


                        <div className="profile-field">

                            <label>
                                Sexo
                            </label>

                            <select
                                name="sexo"
                                value={perfil.sexo}
                                onChange={handleChange}
                            >
                                <option value="">
                                    Seleccionar
                                </option>

                                <option value="masculino">
                                    Masculino
                                </option>

                                <option value="femenino">
                                    Femenino
                                </option>

                                <option value="otro">
                                    Otro
                                </option>

                                <option value="prefiero_no_decirlo">
                                    Prefiero no decirlo
                                </option>

                            </select>

                        </div>


                        <div className="profile-field">

                            <label>
                                Altura (cm)
                            </label>

                            <input
                                type="number"
                                name="altura"
                                min="50"
                                max="250"
                                step="0.1"
                                placeholder="Ej. 175"
                                value={perfil.altura}
                                onChange={handleChange}
                            />

                        </div>


                        <div className="profile-field">

                            <label>
                                Peso (kg)
                            </label>

                            <input
                                type="number"
                                name="peso"
                                min="20"
                                max="300"
                                step="0.1"
                                placeholder="Ej. 70"
                                value={perfil.peso}
                                onChange={handleChange}
                            />

                        </div>

                    </div>

                </section>


                {/* Objetivos */}

                <section className="profile-card">

                    <div className="profile-card-header">

                        <div className="profile-card-icon">
                            🎯
                        </div>

                        <div>
                            <h2>
                                Objetivos
                            </h2>

                            <p>
                                Cuéntanos qué quieres conseguir.
                            </p>
                        </div>

                    </div>


                    <div className="profile-fields">

                        <div className="profile-field full">

                            <label>
                                Objetivo principal
                            </label>

                            <select
                                name="objetivo"
                                value={perfil.objetivo}
                                onChange={handleChange}
                            >
                                <option value="">
                                    Seleccionar objetivo
                                </option>

                                <option value="perder_peso">
                                    Mejorar composición corporal
                                </option>

                                <option value="ganar_musculo">
                                    Ganar fuerza y músculo
                                </option>

                                <option value="mantener">
                                    Mantener mi condición física
                                </option>

                                <option value="mejorar_resistencia">
                                    Mejorar resistencia
                                </option>

                                <option value="mejorar_salud">
                                    Mejorar mi salud y bienestar
                                </option>

                            </select>

                        </div>


                        <div className="profile-field full">

                            <label>
                                Nivel de actividad
                            </label>

                            <select
                                name="nivel_actividad"
                                value={perfil.nivel_actividad}
                                onChange={handleChange}
                            >
                                <option value="">
                                    Seleccionar nivel
                                </option>

                                <option value="sedentario">
                                    Sedentario
                                </option>

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

                </section>


                {error && (
                    <div className="message error">
                        {error}
                    </div>
                )}

                {mensaje && (
                    <div className="message success">
                        ✓ {mensaje}
                    </div>
                )}


                <div className="profile-actions">

                    <button
                        type="submit"
                        className="save-profile-button"
                        disabled={guardando}
                    >
                        {guardando
                            ? "Guardando..."
                            : "Guardar cambios"}
                    </button>

                </div>

            </form>

        </div>
    );
}

export default Profile;

