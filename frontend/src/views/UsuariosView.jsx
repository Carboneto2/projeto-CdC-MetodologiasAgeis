import React, { useState } from "react";
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";

const API_URL = "http://127.0.0.1:5000/api";

export default function UsuariosView() {
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [perfil, setPerfil] = useState("Professor");
  const [msg, setMsg] = useState("");
  const [erro, setErro] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setErro("");

    try {
      const res = await fetch(`${API_URL}/usuarios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          login,
          senha,
          perfil,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.error || "Erro ao criar usuário");
        return;
      }

      setMsg("Usuário criado com sucesso");
      setLogin("");
      setSenha("");
      setPerfil("Professor");
    } catch {
      setErro("Erro de conexão com o servidor");
    }
  };

  return (
    <Card title="Cadastro de Usuários" subtitle="Acesso restrito ao coordenador">
      {msg && <div className="text-green-600 text-sm mb-2">{msg}</div>}
      {erro && <div className="text-red-600 text-sm mb-2">{erro}</div>}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-sm">Login</label>
          <Input
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="text-sm">Senha</label>
          <Input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="text-sm">Perfil</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={perfil}
            onChange={(e) => setPerfil(e.target.value)}
          >
            <option value="Professor">Professor</option>
            <option value="Coordenador">Coordenador</option>
          </select>
        </div>

        <Button type="submit" className="bg-black text-white">
          Criar Usuário
        </Button>
      </form>
    </Card>
  );
}
