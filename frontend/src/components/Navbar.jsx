import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

export function Navbar() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => { logout(); navigate('/login'); };
    
    // --- CORREÇÃO AQUI: Verificação flexível ---
    const isAdmin = user && (
        user.perfil === 'Coordenador' || 
        user.perfil === 'coordenador' || 
        user.login === 'admin'
    );

return (
    <nav className="navbar">
        <div className="navbar-logo">
            <Link to="/" className="navbar-title">
                Sistema Conselho
            </Link>
        </div>

        <div className="navbar-links">
            {isAdmin ? (
                <>
                    <Link to="/dashboard" className="nav-link">Dashboard</Link>

                    <div className="nav-group">
                        <Link to="/turmas" className="nav-link">Turmas</Link>
                        <Link to="/alunos" className="nav-link">Alunos</Link>
                    </div>

                    <Link to="/criar-formulario" className="nav-link">Formulários</Link>
                    <Link to="/comparacao" className="nav-link">Relatórios</Link>
                    <Link to="/usuarios" className="nav-link">Usuários</Link>

                    <Link to="/area-restrita" className="nav-link secondary">Visão Docente</Link>
                </>
            ) : (
                <Link to="/area-restrita" className="nav-link destaque">
                    Responder Formulários
                </Link>
            )}
        </div>

        <div className="navbar-user">
            <div className="user-info">
                <div className="user-name">{user ? user.nome : ''}</div>
                <div className="user-role">{user ? user.perfil : ''}</div>
            </div>

            <button onClick={handleLogout} className="btn-sair">
                Sair
            </button>
        </div>
    </nav>
);

}