
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import StatCard from "../components/StatCard";
import Profile from "./Profile";
import Routines from "./Routines";
import Nutrition from "./Nutrition";
import FitLifeAI from "./FitLifeAI";

function Dashboard({ usuario, pagina, setPagina, onLogout }) {

    return (
        <div className="dashboard">

            <Sidebar
                pagina={pagina}
                setPagina={setPagina}
                onLogout={onLogout}
            />

            <main className="dashboard-main">

                <Header usuario={usuario} />

                <div className="dashboard-content">
                    {pagina === "perfil" ? (
    <Profile />
) : pagina === "rutinas" ? (
    <Routines />
) : pagina === "nutricion" ? (
    <Nutrition />
) : pagina === "ia" ? (
    <FitLifeAI />
) : (
    <>
        {/* todo el contenido actual del Dashboard */}
  

                    {/* Saludo */}

                    <section className="welcome-section">

                        <div>
                            <p className="welcome-small">
                                ¡Qué bueno verte!
                            </p>

                            <h1>
                                Hola, {usuario.nombre} 👋
                            </h1>

                            <p>
                                Mantente constante y sigue
                                trabajando por tus objetivos.
                            </p>
                        </div>

                        <div className="welcome-icon">
                            💪
                        </div>

                    </section>


                    {/* Estadísticas */}

                    <section className="stats-grid">

                        <StatCard
                            icon="🔥"
                            titulo="Racha actual"
                            valor="0 días"
                            descripcion="Comienza hoy"
                        />

                        <StatCard
                            icon="🏋️"
                            titulo="Entrenamientos"
                            valor="0"
                            descripcion="Esta semana"
                        />

                        <StatCard
                            icon="⏱️"
                            titulo="Tiempo activo"
                            valor="0 min"
                            descripcion="Esta semana"
                        />

                        <StatCard
                            icon="🎯"
                            titulo="Objetivo"
                            valor="0%"
                            descripcion="Completado"
                        />

                    </section>


                    {/* Contenido principal */}

                    <section className="dashboard-grid">

                        {/* Rutina */}

                        <div className="dashboard-card workout-card">

                            <div className="card-header">

                                <div>
                                    <span className="card-label">
                                        ENTRENAMIENTO
                                    </span>

                                    <h3>
                                        Rutina de hoy
                                    </h3>
                                </div>

                                <span className="card-icon">
                                    🏋️
                                </span>

                            </div>

                            <div className="empty-state">

                                <div className="empty-icon">
                                    🏃
                                </div>

                                <h4>
                                    Aún no tienes una rutina
                                </h4>

                                <p>
                                    Crea tu primera rutina para
                                    comenzar a entrenar.
                                </p>

                                <button
                                    onClick={() =>
                                        setPagina("rutinas")
                                    }
                                    className="primary-button"
                                >
                                    Crear rutina
                                </button>

                            </div>

                        </div>


                        {/* Progreso */}

                        <div className="dashboard-card">

                            <div className="card-header">

                                <div>
                                    <span className="card-label">
                                        PROGRESO
                                    </span>

                                    <h3>
                                        Esta semana
                                    </h3>
                                </div>

                                <span className="card-icon">
                                    📈
                                </span>

                            </div>

                            <div className="progress-placeholder">

                                <div className="progress-circle">
                                    0%
                                </div>

                                <p>
                                    Completa entrenamientos para
                                    comenzar a ver tu progreso.
                                </p>

                            </div>

                        </div>

                    </section>


                    {/* IA */}

                    <section className="ai-card">

                        <div className="ai-icon">
                            🤖
                        </div>

                        <div className="ai-content">

                            <span>
                                FITLIFE IA
                            </span>

                            <h3>
                                Tu asistente personal
                            </h3>

                            <p>
                                Próximamente podrás recibir
                                recomendaciones personalizadas
                                de entrenamiento y nutrición.
                            </p>

                        </div>

                        <button
                            onClick={() => setPagina("ia")}
                            className="secondary-button"
                        >
                            Explorar IA
                        </button>

                    </section>
                      </>
)}

                </div>

            </main>

        </div>
    );
}

export default Dashboard;

