
function Sidebar({ pagina, setPagina, onLogout }) {
    const opciones = [
        { id: "dashboard", icon: "🏠", nombre: "Inicio" },
        { id: "rutinas", icon: "🏋️", nombre: "Rutinas" },
        { id: "nutricion", icon: "🥗", nombre: "Nutrición" },
        { id: "progreso", icon: "📊", nombre: "Progreso" },
        { id: "perfil", icon: "👤", nombre: "Perfil" },
        { id: "ia", icon: "🤖", nombre: "FitLife IA" }
    ];

    return (
        <aside className="sidebar">

            <div className="sidebar-logo">
                <div className="logo-circle small">
                    F
                </div>

                <span>FitLife</span>
            </div>

            <nav className="sidebar-nav">

                {opciones.map((opcion) => (
                    <button
                        key={opcion.id}
                        className={
                            pagina === opcion.id
                                ? "nav-item active"
                                : "nav-item"
                        }
                        onClick={() => setPagina(opcion.id)}
                    >
                        <span className="nav-icon">
                            {opcion.icon}
                        </span>

                        <span>
                            {opcion.nombre}
                        </span>
                    </button>
                ))}

            </nav>

            <div className="sidebar-bottom">

                <button
                    className="nav-item logout"
                    onClick={onLogout}
                >
                    <span className="nav-icon">
                        🚪
                    </span>

                    Cerrar sesión
                </button>

            </div>

        </aside>
    );
}

export default Sidebar;

