import React, { useState, useMemo } from "react";
import { useTurmas } from "../hooks/useTurmas";
import { useAlunos } from "../hooks/useAlunos";
import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";

export default function AlunosView() {
  const { turmas } = useTurmas();
  const { alunos, add, update, remove } = useAlunos();

  // Estado para edição
  const [editId, setEditId] = useState(null);

  // Campos do formulário
  const [nome, setNome] = useState("");
  const [matricula, setMatricula] = useState("");
  const [turmaId, setTurmaId] = useState("");
  const [foto, setFoto] = useState(""); // Armazena a imagem em Base64

  const [filtroTurma, setFiltroTurma] = useState("");

  // Função para converter a imagem para Base64 (para salvar no navegador)
  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditClick = (a) => {
    setEditId(a.id);
    setNome(a.nome);
    setMatricula(a.matricula);
    setTurmaId(a.turmaId);
    setFoto(a.foto || ""); // Carrega a foto existente ou vazio
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setNome("");
    setMatricula("");
    setTurmaId("");
    setFoto("");
    // Limpa o input file visualmente (truque simples)
    document.getElementById("input-foto").value = "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nome.trim() || !turmaId) return;

    const dadosAluno = { nome, matricula, turmaId, foto };

    if (editId) {
      update(editId, dadosAluno);
      alert("Dados do aluno atualizados com sucesso!");
      handleCancelEdit();
    } else {
      add(dadosAluno);
      alert("Aluno cadastrado com sucesso!");
      // Limpar campos
      setNome("");
      setMatricula("");
      setFoto("");
      document.getElementById("input-foto").value = "";
    }
  };

  const handleExcluir = (id) => {
    if (window.confirm("Tem certeza que deseja remover este aluno?")) {
      remove(id);
      alert("Aluno removido.");
    }
  };

  const alunosFiltrados = useMemo(
    () => alunos.filter((a) => !filtroTurma || a.turmaId === filtroTurma),
    [alunos, filtroTurma],
  );

  return (
    <div className="bg-gray-100 min-h-[calc(100vh-64px)]">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* CABEÇALHO */}
        <header className="bg-white rounded-xl shadow-md border p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-red-700"></div>
          <h1 className="text-2xl font-bold text-green-800">
            Gerenciamento de Alunos
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Cadastro e manutenção dos alunos
          </p>
        </header>

        {/* CONTEÚDO */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* FORMULÁRIO */}
          <Card title={editId ? "Editar aluno" : "Cadastrar aluno"}>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* PREVIEW DA FOTO */}
              <div className="flex justify-center">
                <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden border border-gray-300 flex items-center justify-center">
                  {foto ? (
                    <img
                      src={foto}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400 text-xs">Sem foto</span>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Nome</label>
                <Input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome completo"
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  Matrícula (opcional)
                </label>
                <Input
                  value={matricula}
                  onChange={(e) => setMatricula(e.target.value)}
                  placeholder="00000"
                />
              </div>

              {/* FOTO */}
              <div>
                <label className="text-sm font-medium">Foto do aluno</label>
                <input
                  id="input-foto"
                  type="file"
                  accept="image/*"
                  onChange={handleFotoChange}
                  className="w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-gray-100 file:text-black
                  hover:file:bg-gray-200 mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Turma</label>
                <select
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-700"
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

              <div className="flex flex-wrap gap-3 pt-2">
                <Button className="bg-green-700 text-white" type="submit">
                  {editId ? "Salvar alterações" : "Adicionar aluno"}
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
            title="Alunos cadastrados"
            right={
              <select
                className="rounded-xl border px-3 py-2 text-sm"
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
                <div className="text-sm text-gray-500 text-center py-6">
                  Nenhum aluno encontrado.
                </div>
              )}

              {alunosFiltrados.map((a) => (
                <div
                  key={a.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border rounded-xl p-4 bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 border">
                      {a.foto ? (
                        <img
                          src={a.foto}
                          alt={a.nome}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          Sem foto
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="font-medium text-gray-800">{a.nome}</div>
                      <div className="text-xs text-gray-500">
                        Matrícula: {a.matricula || "—"} • Turma:{" "}
                        {turmas.find((t) => t.id === a.turmaId)?.nome || "?"}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      className="bg-white border"
                      onClick={() => handleEditClick(a)}
                    >
                      Editar
                    </Button>
                    <Button
                      className="bg-red-600 text-white"
                      onClick={() => handleExcluir(a.id)}
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
