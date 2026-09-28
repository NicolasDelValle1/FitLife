
function StatCard({ icon, titulo, valor, descripcion }) {
    return (
        <div className="stat-card">

            <div className="stat-icon">
                {icon}
            </div>

            <div className="stat-content">

                <span className="stat-title">
                    {titulo}
                </span>

                <strong className="stat-value">
                    {valor}
                </strong>

                <span className="stat-description">
                    {descripcion}
                </span>

            </div>

        </div>
    );
}

export default StatCard;

