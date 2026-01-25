import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

export function Navbar() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <Link to="/">Conselho de Classe</Link>
            </div>

            <div className="navbar-links">
                {/* --- LINKS PÚBLICOS (Para todos os usuários logados) --- */}
                
                {/* Agora a Home é o Painel Visual */}
                <Link to="/" className="nav-link">Dashboard</Link>

                {/* Lista de Turmas separada */}
                <Link to="/turmas" className="nav-link">Turmas</Link>

                {/* Telas das Sprints Anteriores */}
                <Link to="/alunos" className="nav-link">Alunos</Link>
                <Link to="/comparacao" className="nav-link">Relatórios</Link>

                {/* --- ÁREA EXCLUSIVA DE COORDENADOR (ADMIN) --- */}
                {user && user.perfil === 'coordenador' && (
                    <>
                        {/* Botão para criar/editar formulários */}
                        <Link to="/criar-formulario" className="nav-link">
                            Modelos de Form
                        </Link>

                        {/* Botão de destaque para criar usuário */}
                        <Link to="/cadastro-usuario" className="nav-link destaque">
                            + Novo Usuário
                        </Link>
                    </>
                )}
            </div>

            <div className="navbar-user">
                <span>Olá, {user ? user.nome : 'Visitante'}</span>
                <button onClick={handleLogout} className="btn-sair">Sair</button>
            </div>
        </nav>
    );
}