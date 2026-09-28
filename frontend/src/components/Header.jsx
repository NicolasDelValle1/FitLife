
function Header({ usuario }) {
    return (
        <header className="dashboard-header">

            <div>
                <p className="header-date">
                    Tu espacio personal
                </p>

                <h2>
                    Dashboard
                </h2>
            </div>

            <div className="header-user">

                <div className="notification">
                    🔔
                </div>

                <div className="user-avatar">
                    {usuario.nombre.charAt(0).toUpperCase()}
                </div>

                <div className="user-info">
                    <strong>
                        {usuario.nombre}
                    </strong>

                    <span>
                        Usuario FitLife
                    </span>
                </div>

            </div>

        </header>
    );
}

export default Header;

