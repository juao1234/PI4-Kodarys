import '../styles/ProfilePage.css';
import { Link } from "react-router-dom";
import SettingsIcon from "@mui/icons-material/Settings";

function ProfilePage() {
    const experiencePercent = 0;

    const progressItems = [
        { name: "Introdução à Sintaxe", percent: 0, color: "gray", icon: "/<>.png", status: "Não Iniciado" },
        { name: "Condições e paradas", percent: 0, color: "gray", icon: "/{ }.png", status: "Não Iniciado" },
        { name: "Manipulação de Listas", percent: 0, color: "gray", icon: "/[ ].png", status: "Não Iniciado" },
        { name: "Classes e Funções", percent: 0, color: "gray", icon: "/f(x).png", status: "Não Iniciado" },
    ];

    const diaryEntries = [
        {
            message: "Boas Vindas ao Kodarys, onde programar pode ser mágico!",
            time: "2 minutos atrás"
        }
    ];

    return (
        <div className="profile-container">
            <header className="profile-header">
                <div className="header-content">
                    <h1 className="logo">Kodarys</h1>
                    <nav className="nav-links">
                        <Link to="/mapa">Mapa do Mundo</Link>
                        <Link to="/perfil" className="active">Perfil</Link>
                        <Link to="/missoes">Missões</Link>
                        <Link to="/logout">Sair</Link>
                    </nav>
                    <div className="config-icon">
                        <SettingsIcon sx={{ color: 'white', cursor: 'pointer' }} />
                    </div>
                </div>
            </header>

            <main className="profile-main">
                <div className="user-card">
                    <div className="avatar-container">
                        <img 
                            src="/UserGeneric.png" 
                            alt="Avatar do usuário" 
                            className="avatar-image"
                        />
                    </div>
                    <h2 className="username">JogadorUm</h2>
                    <p className="user-class">Mago Arcano</p>

                    <div className="experience-section">
                        <p className="experience-label">Experiência</p>
                        <p className="experience-value">0 / 1000 XP</p>
                        <div className="experience-bar">
                            <div 
                                className="experience-fill" 
                                style={{ width: `${experiencePercent}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="user-stats">
                        <div className="stat-item">
                            <span className="stat-label">Nível</span>
                            <span className="stat-value">0</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Moeda do Jogo</span>
                            <span className="stat-value gold">0 Ouro</span>
                        </div>
                        <div className="stat-item full-width">
                            <span className="stat-label">Tempo de Jogo (Horas)</span>
                            <span className="stat-value">0h</span>
                        </div>
                    </div>
                </div>

                <div className="right-column">
                    <section className="code-path-section">
                        <h3 className="section-title">O Caminho do Código</h3>
                        <div className="progress-grid">
                            {progressItems.map((item, index) => (
                                <div className="progress-item" key={index}>
                                    <img 
                                        src={item.icon} 
                                        alt={item.name} 
                                        className="progress-icon-img"
                                    />
                                    <div className="progress-info">
                                        <div className="progress-header">
                                            <p className="progress-name not-started">{item.name}</p>
                                            <span className="progress-status">{item.status}</span>
                                        </div>
                                        <div className="progress-bar-container">
                                            <div className="progress-bar">
                                                <div 
                                                    className={`progress-fill ${item.color}`}
                                                    style={{ width: `${item.percent}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="trophies-section-no-card">
                        <h3 className="section-title">Salão de Troféus</h3>
                        <div className="trophies-container">
                        </div>
                    </section>

                    <section className="diary-section">
                        <h3 className="section-title">Diário de Bordo</h3>
                        <div className="diary-entries">
                            {diaryEntries.map((entry, index) => (
                                <div className="diary-entry" key={index}>
                                    <img 
                                        src="/map_search.png" 
                                        alt="Diário" 
                                        className="diary-icon-img"
                                    />
                                    <div className="diary-content">
                                        <p className="diary-message">{entry.message}</p>
                                        <p className="diary-time">{entry.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}

export default ProfilePage;
