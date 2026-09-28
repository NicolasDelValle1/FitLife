
import { useState } from "react";

function Register() {
    const [form, setForm] = useState({
        nombre: "",
        email: "",
        password: "",
        confirmarPassword: ""
    });

    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");
    const [cargando, setCargando] = useState(false);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMensaje("");
        setError("");

        if (
            !form.nombre ||
            !form.email ||
            !form.password ||
            !form.confirmarPassword
        ) {
            setError("Completa todos los campos.");
            return;
        }

        if (form.password !== form.confirmarPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        setCargando(true);

        try {
            const response = await fetch(
                "http://localhost:3000/api/auth/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        nombre: form.nombre,
                        email: form.email,
                        password: form.password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Error al registrarse");
            }

            setMensaje(data.message);

            setForm({
                nombre: "",
                email: "",
                password: "",
                confirmarPassword: ""
            });

        } catch (error) {
            console.error(error);
            setError(error.message || "No se pudo conectar con el servidor.");
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="register-page">

            <div className="register-card">

                <div className="register-header">
                    <div className="logo-circle">F</div>

                    <h1>Únete a FitLife</h1>

                    <p>
                        Crea tu cuenta y comienza a mejorar
                        tu bienestar.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>

                    <div className="form-group">
                        <label htmlFor="nombre">
                            Nombre
                        </label>

                        <input
                            id="nombre"
                            name="nombre"
                            type="text"
                            placeholder="Tu nombre"
                            value={form.nombre}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">
                            Correo electrónico
                        </label>

                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="correo@ejemplo.com"
                            value={form.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">
                            Contraseña
                        </label>

                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Crea una contraseña"
                            value={form.password}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmarPassword">
                            Confirmar contraseña
                        </label>

                        <input
                            id="confirmarPassword"
                            name="confirmarPassword"
                            type="password"
                            placeholder="Repite tu contraseña"
                            value={form.confirmarPassword}
                            onChange={handleChange}
                        />
                    </div>

                    {error && (
                        <div className="message error">
                            {error}
                        </div>
                    )}

                    {mensaje && (
                        <div className="message success">
                            {mensaje}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="register-button"
                        disabled={cargando}
                    >
                        {cargando
                            ? "Creando cuenta..."
                            : "Crear cuenta"}
                    </button>

                </form>

                <div className="login-link">
                    ¿Ya tienes una cuenta?
                    <button type="button">
                        Iniciar sesión
                    </button>
                </div>

            </div>

        </div>
    );
}

export default Register;

