import React, { useState } from "react";

// Importamos os componentes de UI que criamos
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";
import Tag from "../components/Tag";

export default function LoginView({ login, register }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [err, setErr] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setErr("");
    if (isRegister) {
      const r = register(nome.trim(), email.trim(), senha);
      if (!r.ok) return setErr(r.message);
      setIsRegister(false); // Volta para a tela de login
      return;
    }
    const r = login(email.trim(), senha);
    if (!r.ok) return setErr(r.message);
    // sucesso: App re-renderiza porque o mesmo hook de auth é usado lá
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card
        className="w-full max-w-md"
        title={isRegister ? "Criar conta" : "Entrar"}
        subtitle="Sistema de Conselho de Classe"
      >
        {err && <div className="mb-3 text-sm text-red-600">{err}</div>}

        <form onSubmit={handleSubmit} className="space-y-3">
          {isRegister && (
            <div>
              <label className="text-sm">Nome</label>
              <Input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome"
                required
              />
            </div>
          )}
          <div>
            <label className="text-sm">E-mail</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@escola"
              required
            />
          </div>
          <div>
            <label className="text-sm">Senha</label>
            <Input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••"
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <Button className="bg-black text-white" type="submit">
              {isRegister ? "Registrar" : "Entrar"}
            </Button>
            <button
              type="button"
              className="text-sm underline"
              onClick={() => setIsRegister((v) => !v)}
            >
              {isRegister ? "Já tenho conta" : "Criar conta"}
            </button>
          </div>
          <div className="text-xs text-gray-500">
            Dica: use <Tag>admin@escola</Tag> / <Tag>123456</Tag> para testar
            rápido.
          </div>
        </form>
      </Card>
    </div>
  );
}