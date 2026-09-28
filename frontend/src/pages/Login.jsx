
import { useState } from "react";

function Login({ onLogin }) {
    const [form, setForm] = useState({
        email: "",
        password: ""
    });

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

        setError("");

        if (!form.email || !form.password) {
            setError("Completa todos los campos.");
            return;
        }

        setCargando(true);

        try {
            const response = await fetch(
                "http://localhost:3000/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(form)
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Error al iniciar sesión"
                );
            }

            // Guardar sesión
            localStorage.setItem("token", data.token);
            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );

            // Avisar a App.jsx
            if (onLogin) {
                onLogin(data.user);
            }

        } catch (error) {
            console.error(error);
            setError(
                error.message ||
                "No se pudo conectar con el servidor."
            );
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="register-page">

            <div className="register-card">

                <div className="register-header">

                    <div className="logo-circle">
                        F
                    </div>

                    <h1>Bienvenido a FitLife</h1>

                    <p>
                        Inicia sesión para continuar
                        con tu progreso.
                    </p>

                </div>

                <form onSubmit={handleSubmit}>

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
                            placeholder="Tu contraseña"
                            value={form.password}
                            onChange={handleChange}
                        />

                    </div>

                    {error && (
                        <div className="message error">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="register-button"
                        disabled={cargando}
                    >
                        {cargando
                            ? "Iniciando sesión..."
                            : "Iniciar sesión"}
                    </button>

                </form>

                <div className="login-link">

                    ¿No tienes una cuenta?

                    <button type="button">
                        Crear cuenta
                    </button>

                </div>

            </div>

        </div>
    );
}

export default Login;
