import React, { useState } from "react";

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (isRegister) {
      const r = register(nome.trim(), email.trim(), senha);
      if (!r.ok) return setErr(r.message);
      setIsRegister(false);
      return;
    }

    const r = await login(email.trim(), senha);
    if (!r.ok) return setErr(r.message);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ifverde via-ifverdeclaro to-ifverde flex items-center justify-center p-4">
      <Card
        className="w-full max-w-md border-t-4 border-ifvermelho"
        title={
          <div className="flex flex-col items-center gap-2">
            {/* LOGO IF */}
            <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center text-ifverde font-extrabold text-2xl shadow">
              IF
            </div>

            <span className="text-ifverde text-lg font-semibold">
              Instituto Federal
            </span>
          </div>
        }
        subtitle="Sistema de Conselho de Classe"
      >
        {err && (
          <div className="mb-3 text-sm text-ifvermelho font-medium">{err}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {isRegister && (
            <div>
              <label className="text-sm font-medium">Nome</label>
              <Input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome"
                required
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium">E-mail</label>
            <Input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="coordenador"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Senha</label>
            <Input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••"
              required
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button
              className="bg-ifverde text-white hover:bg-ifverdeclaro"
              type="submit"
            >
              {isRegister ? "Registrar" : "Entrar"}
            </Button>

            <button
              type="button"
              className="text-sm text-ifverde underline"
              onClick={() => setIsRegister((v) => !v)}
            >
              {isRegister ? "Já tenho conta" : "Criar conta"}
            </button>
          </div>

          <div className="text-xs text-gray-600 pt-2">
            Dica: use <Tag>coordenador</Tag> / <Tag>123456</Tag>
          </div>
        </form>
      </Card>
    </div>
  );
}
