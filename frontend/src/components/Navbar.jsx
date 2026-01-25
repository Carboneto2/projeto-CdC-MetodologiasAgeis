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
                <Link to="/" className="font-bold text-xl hover:text-gray-200">
                    Conselho de Classe
                </Link>
            </div>

            <div className="navbar-links flex gap-6">
                {isAdmin ? (
                    <>
                        <Link to="/dashboard" className="nav-link font-semibold">📊 Dashboard</Link>
                        
                        <div className="flex gap-4 border-l border-r border-blue-700 px-4 mx-2">
                            <Link to="/turmas" className="nav-link">Turmas</Link>
                            <Link to="/alunos" className="nav-link">Alunos</Link>
                        </div>

                        <Link to="/criar-formulario" className="nav-link">Formulários</Link>
                        <Link to="/comparacao" className="nav-link">Relatórios</Link>

                        <Link to="/usuarios" className="nav-link destaque text-yellow-300">👥 Usuários</Link>
                        
                        <Link to="/area-restrita" className="nav-link text-xs opacity-70 pt-1">(Visão Docente)</Link>
                    </>
                ) : (
                    <Link to="/area-restrita" className="nav-link font-bold">📝 Responder Formulários</Link>
                )}
            </div>

            <div className="navbar-user flex items-center gap-4">
                <div className="text-right leading-tight">
                    <div className="font-bold">{user ? user.nome : ''}</div>
                    <div className="text-xs opacity-75">{user ? user.perfil : ''}</div>
                </div>
                <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm font-bold transition">Sair</button>
            </div>
        </nav>
    );
}