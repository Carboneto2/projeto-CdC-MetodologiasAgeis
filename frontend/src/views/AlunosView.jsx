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
    [alunos, filtroTurma]
  );

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card title={editId ? "Editar aluno" : "Cadastrar aluno"}>
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Preview da Foto */}
          <div className="flex justify-center mb-4">
            <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden border border-gray-300 flex items-center justify-center">
              {foto ? (
                <img src={foto} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-400 text-xs">Sem foto</span>
              )}
            </div>
          </div>

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

          {/* Campo de Foto */}
          <div>
            <label className="text-sm">Foto do Aluno</label>
            <input
              id="input-foto"
              type="file"
              accept="image/*"
              onChange={handleFotoChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-black hover:file:bg-gray-200 mt-1"
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

          <div className="flex gap-2 pt-2">
            <Button className="bg-black text-white" type="submit">
              {editId ? "Salvar Alterações" : "Adicionar"}
            </Button>
            {editId && (
              <Button type="button" onClick={handleCancelEdit} className="bg-gray-200">
                Cancelar
              </Button>
            )}
          </div>
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
              <div className="flex items-center gap-3">
                {/* Miniatura da foto na lista */}
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 border">
                  {a.foto ? (
                    <img src={a.foto} alt={a.nome} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      📷
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-medium">{a.nome}</div>
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
  );
}