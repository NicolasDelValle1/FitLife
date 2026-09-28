
import { useState } from "react";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

import "./App.css";

function App() {

    const [paginaAuth, setPaginaAuth] = useState("login");

    const [usuario, setUsuario] = useState(() => {
        const savedUser = localStorage.getItem("user");

        return savedUser
            ? JSON.parse(savedUser)
            : null;
    });

    const [pagina, setPagina] = useState("dashboard");


    const handleLogin = (user) => {
        setUsuario(user);
        setPagina("dashboard");
    };


    const handleLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setUsuario(null);
        setPaginaAuth("login");

    };


    // Usuario NO autenticado

    if (!usuario) {

        if (paginaAuth === "register") {

            return (
                <>
                    <Register />

                    <div className="switch-page">
                        <button
                            onClick={() =>
                                setPaginaAuth("login")
                            }
                        >
                            Ya tengo una cuenta
                        </button>
                    </div>
                </>
            );

        }

        return (
            <>
                <Login onLogin={handleLogin} />

                <div className="switch-page">
                    <button
                        onClick={() =>
                            setPaginaAuth("register")
                        }
                    >
                        Crear una cuenta
                    </button>
                </div>
            </>
        );
    }


    // Usuario autenticado

    return (
        <Dashboard
            usuario={usuario}
            pagina={pagina}
            setPagina={setPagina}
            onLogout={handleLogout}
        />
    );
}

export default App;

