import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./LoginView.css"; // Mantenha seu CSS se já existir

export function LoginView() {
  const { login } = useContext(AuthContext); // Pega a função de login do Contexto
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro(""); // Limpa mensagens antigas

    const sucesso = await login(usuario, senha);

    if (sucesso) {
      navigate("/"); // Se deu certo, vai para a Home
    } else {
      setErro("Usuário ou senha incorretos!");
    }
  };

  return (
    <div className="login-wrapper">
      {" "}
      {/* Use as classes do seu CSS aqui */}
      <div className="login-container">
        <div className="login-card">
          {/* Logo IF */}
          <div className="login-logo">IF</div>

          {/* Título */}
          <div className="login-header">
            <h1>Sistema Conselho</h1>
            <p>Instituto Federal</p>
          </div>

          {erro && <p className="login-error">{erro}</p>}

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label>Login</label>
              <input
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Senha</label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-entrar">
              ENTRAR
            </button>
          </form>

          {/* Rodapé */}
          <footer className="login-footer">
            <p>Ana Francino • Gustavo Gil • Lara Prates • Pedro Sergio</p>
          </footer>
        </div>
      </div>
    </div>
  );
}
