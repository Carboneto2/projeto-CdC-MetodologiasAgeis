import React, { useState } from "react";
import { useTurmas } from "../hooks/useTurmas";
import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";

export default function TurmasView() {
  const { turmas, add, update, remove } = useTurmas();
  const [nome, setNome] = useState("");
  const [ano, setAno] = useState("");
  const [turno, setTurno] = useState("Manhã");

  const handleAdd = (e) => {
    e.preventDefault();
    if (!nome.trim()) return;
    add({ nome: nome.trim(), ano: ano || new Date().getFullYear(), turno });
    setNome("");
    setAno("");
  };

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card title="Cadastrar turma">
        <form onSubmit={handleAdd} className="space-y-3">
          <div>
            <label className="text-sm">Nome da turma</label>
            <Input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: 2º ano A"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm">Ano</label>
              <Input
                value={ano}
                onChange={(e) => setAno(e.target.value)}
                placeholder="2025"
              />
            </div>
            <div>
              <label className="text-sm">Turno</label>
              <select
                className="w-full rounded-xl border border-gray-300 px-3 py-2"
                value={turno}
                onChange={(e) => setTurno(e.target.value)}
              >
                <option>Manhã</option>
                <option>Tarde</option>
                <option>Noite</option>
              </select>
            </div>
          </div>
          <Button className="bg-black text-white" type="submit">
            Adicionar
          </Button>
        </form>
      </Card>

      <Card title="Turmas cadastradas" subtitle={`${turmas.length} turma(s)`}>
        <div className="space-y-3">
          {turmas.length === 0 && (
            <div className="text-sm text-gray-500">
              Nenhuma turma cadastrada ainda.
            </div>
          )}
          {turmas.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between gap-3 border rounded-xl p-3"
            >
              <div>
                <div className="font-medium">{t.nome}</div>
                <div className="text-xs text-gray-500">
                  Ano {t.ano} • {t.turno}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  className="bg-white border"
                  onClick={() => {
                    const novoNome = prompt("Novo nome da turma", t.nome);
                    if (novoNome !== null) update(t.id, { nome: novoNome });
                  }}
                >
                  Editar
                </Button>
                <Button
                  className="bg-red-600 text-white"
                  onClick={() => remove(t.id)}
                >
                  Excluir
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}