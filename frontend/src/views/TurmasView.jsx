import React, { useState } from "react";
import { useTurmas } from "../hooks/useTurmas";
import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";

export default function TurmasView() {
  const { turmas, add, update, remove } = useTurmas();

  // Estado para controlar a edição
  const [editId, setEditId] = useState(null);

  const [nome, setNome] = useState("");
  const [ano, setAno] = useState("");
  const [turno, setTurno] = useState("Manhã");

  // Prepara o formulário para edição ao clicar no botão Editar
  const handleEditClick = (t) => {
    setEditId(t.id);
    setNome(t.nome);
    setAno(t.ano);
    setTurno(t.turno);
  };

  // Cancela a edição
  const handleCancelEdit = () => {
    setEditId(null);
    setNome("");
    setAno("");
    setTurno("Manhã");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nome.trim()) return;

    if (editId) {
      // Atualizando turma existente
      update(editId, { nome, ano, turno });
      alert("Turma atualizada com sucesso!");
      handleCancelEdit();
    } else {
      // Criando nova turma
      add({ nome: nome.trim(), ano: ano || new Date().getFullYear(), turno });
      alert("Cadastro realizado com sucesso!");
      // Limpa campos
      setNome("");
      setAno("");
    }
  };

  const handleExcluir = (id) => {
    if (window.confirm("Tem certeza que deseja excluir esta turma?")) {
      remove(id);
    }
  };

  return (
    <div className="bg-gray-100 min-h-[calc(100vh-64px)]">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* CABEÇALHO */}
        <header className="bg-white rounded-xl shadow-md border p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-red-700"></div>
          <h1 className="text-2xl font-bold text-green-800">
            Gerenciamento de Turmas
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Cadastro e manutenção das turmas
          </p>
        </header>

        {/* CONTEÚDO */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* FORMULÁRIO */}
          <Card title={editId ? "Editar turma" : "Cadastrar turma"}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nome da turma</label>
                <Input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex.: 2º ano A"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Ano</label>
                  <Input
                    value={ano}
                    onChange={(e) => setAno(e.target.value)}
                    placeholder="2025"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Turno</label>
                  <select
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-700"
                    value={turno}
                    onChange={(e) => setTurno(e.target.value)}
                  >
                    <option>Manhã</option>
                    <option>Tarde</option>
                    <option>Noite</option>
                    <option>Integral</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button className="bg-green-700 text-white" type="submit">
                  {editId ? "Salvar alterações" : "Adicionar turma"}
                </Button>

                {editId && (
                  <Button
                    type="button"
                    onClick={handleCancelEdit}
                    className="bg-gray-200"
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </Card>

          {/* LISTAGEM */}
          <Card
            title="Turmas cadastradas"
            subtitle={`${turmas.length} turma(s)`}
          >
            <div className="space-y-3">
              {turmas.length === 0 && (
                <div className="text-sm text-gray-500 text-center py-6">
                  Nenhuma turma cadastrada ainda.
                </div>
              )}

              {turmas.map((t) => (
                <div
                  key={t.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border rounded-xl p-4 bg-gray-50"
                >
                  <div>
                    <div className="font-medium text-gray-800">{t.nome}</div>
                    <div className="text-xs text-gray-500">
                      Ano {t.ano} • {t.turno}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      className="bg-white border"
                      onClick={() => handleEditClick(t)}
                    >
                      Editar
                    </Button>

                    <Button
                      className="bg-red-600 text-white"
                      onClick={() => handleExcluir(t.id)}
                    >
                      Excluir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
