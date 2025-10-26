import { useState, useEffect } from "react";
import { readLS, writeLS, LS_KEYS } from "../lib/storage";

export function useAuth() {
  const [user, setUser] = useState(() => readLS(LS_KEYS.AUTH, null));

  useEffect(() => {
    // garante usuário demo
    const users = readLS(LS_KEYS.USERS, []);
    if (!users.find((u) => u.email === "admin@escola")) {
      users.push({
        id: crypto.randomUUID(),
        email: "admin@escola",
        nome: "Admin",
        senha: "123456",
      });
      writeLS(LS_KEYS.USERS, users);
    }
  }, []);

  const login = (email, senha) => {
    const users = readLS(LS_KEYS.USERS, []);
    const u = users.find((x) => x.email === email && x.senha === senha);
    if (u) {
      writeLS(LS_KEYS.AUTH, { id: u.id, email: u.email, nome: u.nome });
      setUser({ id: u.id, email: u.email, nome: u.nome });
      return { ok: true };
    }
    return { ok: false, message: "Credenciais inválidas" };
  };
  const logout = () => {
    localStorage.removeItem(LS_KEYS.AUTH);
    setUser(null);
  };
  const register = (nome, email, senha) => {
    const users = readLS(LS_KEYS.USERS, []);
    if (users.find((u) => u.email === email))
      return { ok: false, message: "E-mail já cadastrado" };
    const novo = { id: crypto.randomUUID(), nome, email, senha };
    users.push(novo);
    writeLS(LS_KEYS.USERS, users);
    return { ok: true };
  };
  return { user, login, logout, register };
}