import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Verifica se já existe um login salvo ao abrir o navegador
        const recoveredUser = localStorage.getItem('usuario_conselho');
        if (recoveredUser) {
            setUser(JSON.parse(recoveredUser));
        }
        setLoading(false);
    }, []);

    const login = async (loginData, senha) => {
        try {
            const response = await fetch('http://localhost:5000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ login: loginData, senha })
            });

            const data = await response.json();

            if (response.ok) {
                setUser(data.usuario);
                localStorage.setItem('usuario_conselho', JSON.stringify(data.usuario));
                return true;
            } else {
                alert(data.erro || "Erro ao entrar");
                return false;
            }
        } catch (error) {
            console.error("Erro no login:", error);
            alert("Erro de conexão com o servidor.");
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('usuario_conselho');
    };

    return (
        <AuthContext.Provider value={{ authenticated: !!user, user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};