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
                {/* 1. TELA DE TURMAS (Home) */}
                <Link to="/" className="nav-link">Turmas</Link>

                {/* 2. TELA DE ALUNOS (Sprint anterior) */}
                <Link to="/alunos" className="nav-link">Alunos</Link>

                {/* 3. TELA DE COMPARAÇÃO (Sprint anterior) */}
                <Link to="/comparacao" className="nav-link">Relatórios</Link>

                {/* 4. BOTÃO EXCLUSIVO DE ADMIN (Novo Usuário) */}
                {user && user.perfil === 'coordenador' && (
                    <Link to="/cadastro-usuario" className="nav-link destaque">
                        + Novo Usuário
                    </Link>
                )}
            </div>

            <div className="navbar-user">
                <span>Olá, {user ? user.nome : 'Visitante'}</span>
                <button onClick={handleLogout} className="btn-sair">Sair</button>
            </div>
        </nav>
    );
}