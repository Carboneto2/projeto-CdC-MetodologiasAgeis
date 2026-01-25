import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './LoginView.css'; // Mantenha seu CSS se já existir

export function LoginView() {
    const { login } = useContext(AuthContext); // Pega a função de login do Contexto
    const navigate = useNavigate();
    
    const [usuario, setUsuario] = useState('');
    const [senha, setSenha] = useState('');
    const [erro, setErro] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setErro(''); // Limpa mensagens antigas
        
        const sucesso = await login(usuario, senha);
        
        if (sucesso) {
            navigate('/'); // Se deu certo, vai para a Home
        } else {
            setErro('Usuário ou senha incorretos!');
        }
    };

    return (
        <div className="login-wrapper"> {/* Use as classes do seu CSS aqui */}
            <div className="login-card">
                <h1>Sistema Conselho</h1>
                <p>Faça login para continuar</p>
                
                {erro && <p style={{color: 'red'}}>{erro}</p>}

                <form onSubmit={handleLogin}>
                    <div style={{marginBottom: '15px'}}>
                        <label>Login:</label>
                        <input 
                            type="text" 
                            value={usuario} 
                            onChange={(e) => setUsuario(e.target.value)}
                            required 
                            style={{width: '100%', padding: '8px'}}
                        />
                    </div>
                    <div style={{marginBottom: '15px'}}>
                        <label>Senha:</label>
                        <input 
                            type="password" 
                            value={senha} 
                            onChange={(e) => setSenha(e.target.value)}
                            required 
                            style={{width: '100%', padding: '8px'}}
                        />
                    </div>
                    <button type="submit" style={{width: '100%', padding: '10px', cursor: 'pointer'}}>
                        ENTRAR
                    </button>
                </form>
            </div>
        </div>
    );
}