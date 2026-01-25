import { useState } from "react";
import { readLS, writeLS, LS_KEYS } from "../lib/storage";

const API_URL = "http://127.0.0.1:5000/api";

export function useAuth() {
  const [user, setUser] = useState(() => readLS(LS_KEYS.AUTH, null));

  const login = async (email, senha) => {
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          login: email,
          senha: senha,
        }),
      });

      if (!res.ok) {
        return { ok: false, message: "Credenciais inválidas" };
      }

      const data = await res.json();

      const usuarioLogado = {
        id: data.usuario.id,
        email: data.usuario.login,
        perfil: data.usuario.perfil,
      };

      writeLS(LS_KEYS.AUTH, usuarioLogado);
      setUser(usuarioLogado);

      return { ok: true };
    } catch {
      return { ok: false, message: "Erro ao conectar com o servidor" };
    }
  };

  const logout = () => {
    localStorage.removeItem(LS_KEYS.AUTH);
    setUser(null);
  };

  const register = () => {
    return { ok: false, message: "Cadastro desativado" };
  };

  return { user, login, logout, register };
}
