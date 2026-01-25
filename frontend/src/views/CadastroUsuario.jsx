import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CadastroUsuario.css'; // Já vamos criar esse estilo

export function CadastroUsuario() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        nome: '',
        login: '',
        senha: '',
        perfil: 'professor'
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const response = await fetch('http://localhost:5000/usuarios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            if (response.ok) {
                alert('Usuário cadastrado com sucesso!');
                navigate('/'); // Volta para a home
            } else {
                const data = await response.json();
                alert(data.erro || 'Erro ao cadastrar');
            }
        } catch (error) {
            alert('Erro de conexão com o servidor');
        }
    };

    return (
        <div className="cadastro-wrapper">
            <div className="cadastro-card">
                <h2>Novo Usuário</h2>
                <form onSubmit={handleSubmit}>
                    <div className="campo">
                        <label>Nome Completo</label>
                        <input name="nome" value={form.nome} onChange={handleChange} required />
                    </div>

                    <div className="campo">
                        <label>Login de Acesso</label>
                        <input name="login" value={form.login} onChange={handleChange} required />
                    </div>

                    <div className="campo">
                        <label>Senha Inicial</label>
                        <input type="password" name="senha" value={form.senha} onChange={handleChange} required />
                    </div>

                    <div className="campo">
                        <label>Perfil de Acesso</label>
                        <select name="perfil" value={form.perfil} onChange={handleChange}>
                            <option value="professor">Professor</option>
                            <option value="coordenador">Coordenador (Admin)</option>
                        </select>
                    </div>

                    <div className="botoes">
                        <button type="submit" className="btn-salvar">Salvar Usuário</button>
                        <button type="button" onClick={() => navigate('/')} className="btn-cancelar">Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}