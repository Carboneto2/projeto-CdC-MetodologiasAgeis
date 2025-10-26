import React, { useState, useMemo } from "react";
import { useTurmas } from "../hooks/useTurmas";
import { useAlunos } from "../hooks/useAlunos";
import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";

export default function AlunosView() {
  const { turmas } = useTurmas();
  const { alunos, add, update, remove } = useAlunos();

  const [nome, setNome] = useState("");
  const [matricula, setMatricula] = useState("");
  const [turmaId, setTurmaId] = useState("");
  const [filtroTurma, setFiltroTurma] = useState("");

  const handleAdd = (e) => {
    e.preventDefault();
    if (!nome.trim() || !turmaId) return;
    add({ nome: nome.trim(), matricula: matricula.trim(), turmaId });
    setNome("");
    setMatricula("");
  };

  const alunosFiltrados = useMemo(
    () => alunos.filter((a) => !filtroTurma || a.turmaId === filtroTurma),
    [alunos, filtroTurma]
  );

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card title="Cadastrar aluno">
        <form onSubmit={handleAdd} className="space-y-3">
          <div>
            <label className="text-sm">Nome</label>
            <Input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome completo"
            />
          </div>
          <div>
            <label className="text-sm">Matrícula (opcional)</label>
            <Input
              value={matricula}
              onChange={(e) => setMatricula(e.target.value)}
              placeholder="00000"
            />
          </div>
          <div>
            <label className="text-sm">Turma</label>
            <select
              className="w-full rounded-xl border border-gray-300 px-3 py-2"
              value={turmaId}
              onChange={(e) => setTurmaId(e.target.value)}
              required
            >
              <option value="">Selecione</option>
              {turmas.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome} — {t.ano} ({t.turno})
                </option>
              ))}
            </select>
          </div>
          <Button className="bg-black text-white" type="submit">
            Adicionar
          </Button>
        </form>
      </Card>

      <Card
        title="Alunos"
        right={
          <select
            className="rounded-xl border px-3 py-2"
            value={filtroTurma}
            onChange={(e) => setFiltroTurma(e.target.value)}
          >
            <option value="">Todas as turmas</option>
            {turmas.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome}
              </option>
            ))}
          </select>
        }
      >
        <div className="space-y-3">
          {alunosFiltrados.length === 0 && (
            <div className="text-sm text-gray-500">
              Nenhum aluno encontrado.
            </div>
          )}
          {alunosFiltrados.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between gap-3 border rounded-xl p-3"
            >
              <div>
                <div className="font-medium">{a.nome}</div>
                <div className="text-xs text-gray-500">
                  Matrícula: {a.matricula || "—"} • Turma:{" "}
                  {turmas.find((t) => t.id === a.turmaId)?.nome || "?"}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  className="bg-white border"
                  onClick={() => {
                    const novoNome = prompt("Novo nome", a.nome);
                    if (novoNome !== null) update(a.id, { nome: novoNome });
                  }}
                >
                  Editar
                </Button>
                <Button
                  className="bg-red-600 text-white"
                  onClick={() => remove(a.id)}
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