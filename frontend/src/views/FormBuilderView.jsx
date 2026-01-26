import React, { useState, useEffect } from "react";
import { generateId } from "../lib/storage";

const CARGOS_SISTEMA = [
  "Docente",
  "Coordenador",
  "NAE - Atendimento Psicológico",
  "NAE - Assistente Social",
  "NAE - Assistente de Aluno",
  "NAPNE",
  "NEABI",
  "NEPGES"
];

export default function FormBuilderView() {
  const [titulo, setTitulo] = useState("Conselho de Classe — Modelo Novo");
  const [descricao, setDescricao] = useState("Descrição do formulário...");
  const [perguntas, setPerguntas] = useState([]);
  const [listaFormularios, setListaFormularios] = useState([]);
  const [editandoId, setEditandoId] = useState(null);

  // --- CARREGAR FORMULÁRIOS DO BANCO ---
  const carregarFormularios = async () => {
    try {
      const res = await fetch('http://localhost:5000/formularios');
      if (res.ok) {
        const data = await res.json();
        setListaFormularios(data);
      }
    } catch (error) {
      console.error("Erro ao carregar formulários:", error);
    }
  };

  useEffect(() => {
    carregarFormularios();
  }, []);

  // --- MODELO OFICIAL ATUALIZADO ---
  const gerarModeloPadrao = () => {
    if (perguntas.length > 0 && !window.confirm("Isso substituirá suas perguntas atuais. Continuar?")) return;

    setTitulo("Conselho de Classe — Modelo Oficial Completo");
    setDescricao("Análise por setores: Docente, NAE, NAPNE, NEPGES e NEABI.");

    const P_DOCENTE = ["Docente", "Coordenador"];
    const P_NAE_PSICO = ["NAE - Atendimento Psicológico", "Coordenador"];
    const P_NAE_SOCIAL = ["NAE - Assistente Social", "Coordenador"];
    const P_NAPNE = ["NAPNE", "Coordenador"];
    const P_NEPGES = ["NEPGES", "Coordenador"];
    const P_NEABI = ["NEABI", "Coordenador"];

    setPerguntas([
      { id: generateId(), tipo: "texto_longo", enunciado: "Qual(is) é(são) o(s) estudante(s) destaque(s)?", perfis: P_DOCENTE },
      { id: generateId(), tipo: "texto_longo", enunciado: "Qual(is) é(são) o(s) estudante(s) infrequente(s)?", perfis: P_DOCENTE },
      { 
        id: generateId(), 
        tipo: "multipla", 
        enunciado: "1. Quais são as potencialidades da turma?", 
        opcoes: ["Engajamento", "Colaboração", "Participação", "Respeito mútuo", "Motivados", "Outro"], 
        perfis: P_DOCENTE 
      },
      { 
        id: generateId(), 
        tipo: "multipla", 
        enunciado: "2. Quais são as fragilidades da turma?", 
        opcoes: ["Baixo envolvimento", "Dificuldade colaboração", "Falta de respeito", "Frequência irregular", "Procrastinação", "Outro"], 
        perfis: P_DOCENTE 
      },
      { id: generateId(), tipo: "multipla", enunciado: "3. Sugere encaminhamento ao psicológico?", opcoes: ["Sim", "Não"], perfis: P_DOCENTE },
      { id: generateId(), tipo: "texto_longo", enunciado: "3.1. Se sim, qual(is) estudante(s) sugere para o psicológico?", perfis: P_DOCENTE },
      { id: generateId(), tipo: "texto_longo", enunciado: "4. Qual(is) discente(s) apresenta(m) maior dificuldade de aprendizagem?", perfis: P_DOCENTE },
      { id: generateId(), tipo: "texto_longo", enunciado: "5. Quais estudantes não atingiram a média no trimestre?", perfis: P_DOCENTE },
      { id: generateId(), tipo: "texto_longo", enunciado: "7. (NAE Social) Qual(is) estudante(s) atendido(s) pelo Serviço Social?", perfis: P_NAE_SOCIAL },
      { id: generateId(), tipo: "texto_longo", enunciado: "8. (NAE Psico) Qual(is) estudante(s) atendido(s) pelo serviço psicológico?", perfis: P_NAE_PSICO },
      { id: generateId(), tipo: "texto_longo", enunciado: "9. (NAPNE) Relação de discentes com necessidades específicas:", perfis: P_NAPNE },
      { id: generateId(), tipo: "multipla", enunciado: "10. (NEPGES) Ações sobre gênero e sexualidade?", opcoes: ["Sim", "Não"], perfis: P_NEPGES },
      { id: generateId(), tipo: "texto_longo", enunciado: "10.1. Relate as ações:", perfis: P_NEPGES },
      { id: generateId(), tipo: "multipla", enunciado: "11. (NEABI) Ações sobre relações étnico-raciais?", opcoes: ["Sim", "Não"], perfis: P_NEABI },
      { id: generateId(), tipo: "texto_longo", enunciado: "11.1. Relate as ações:", perfis: P_NEABI }
    ]);
  };

  // --- FUNÇÕES DE MANIPULAÇÃO ---
  const addPergunta = (tipo) => {
    setPerguntas([...perguntas, { 
      id: generateId(), 
      tipo, 
      enunciado: "", 
      opcoes: tipo === "multipla" ? ["Sim", "Não"] : undefined, 
      perfis: [...CARGOS_SISTEMA] 
    }]);
  };

  const removePergunta = (id) => setPerguntas(perguntas.filter(p => p.id !== id));

  const updatePergunta = (id, campo, valor) => {
    setPerguntas(perguntas.map(p => p.id === id ? { ...p, [campo]: valor } : p));
  };

  const toggleCargo = (idPergunta, cargo) => {
    setPerguntas(perguntas.map(p => {
      if (p.id !== idPergunta) return p;
      const novosPerfis = p.perfis.includes(cargo) 
        ? p.perfis.filter(c => c !== cargo) 
        : [...p.perfis, cargo];
      return { ...p, perfis: novosPerfis };
    }));
  };

  // --- SALVAR, EDITAR E EXCLUIR ---
  const salvarFormulario = async () => {
    if (!titulo.trim() || perguntas.length === 0) return alert("Preencha título e questões.");
    try {
      const res = await fetch('http://localhost:5000/formularios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo, descricao, perguntas })
      });
      if (res.ok) {
        alert("✅ Formulário salvo com sucesso!");
        setEditandoId(null);
        setTitulo("Conselho de Classe — Modelo Novo");
        setPerguntas([]);
        carregarFormularios();
      }
    } catch (e) { alert("Erro ao salvar."); }
  };

  const handleEditar = (form) => {
    setEditandoId(form.id);
    setTitulo(form.titulo);
    setDescricao(form.descricao || "");
    setPerguntas(form.perguntas);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExcluir = async (id) => {
    if (!window.confirm("Deseja apagar permanentemente este modelo?")) return;
    try {
      const res = await fetch(`http://localhost:5000/formularios/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert("Excluído!");
        carregarFormularios();
      }
    } catch (e) { alert("Erro ao excluir."); }
  };

 return (
  <div className="bg-gray-100 min-h-[calc(100vh-64px)]">
    <div className="max-w-7xl mx-auto p-6 space-y-6">

      {/* CABEÇALHO */}
      <header className="bg-white rounded-xl shadow-md border p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-red-700"></div>
        <h1 className="text-2xl font-bold text-green-800">
          Gerenciamento de Formulários
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Criação e manutenção dos modelos de Conselho de Classe
        </p>
      </header>

      {/* EDITOR DE FORMULÁRIO */}
      <section className="bg-white p-6 rounded-xl shadow-md border space-y-8">

        {/* TOPO */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 border-b pb-4">
          <h2 className="text-xl font-bold text-gray-800">
            {editandoId ? "Editando modelo" : "Criar novo formulário"}
          </h2>
          <button
            onClick={gerarModeloPadrao}
            className="bg-green-700 text-white px-5 py-2 rounded-lg font-semibold hover:bg-green-800 transition-all"
          >
            Carregar modelo oficial
          </button>
        </div>

        {/* TÍTULO / DESCRIÇÃO */}
        <div className="grid gap-6">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">
              Título do formulário
            </label>
            <input
              className="w-full text-lg font-semibold border-b-2 border-gray-200 p-2 outline-none focus:border-green-700 transition-all bg-transparent"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Conselho de Classe 2026"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">
              Descrição / instruções
            </label>
            <textarea
              className="w-full p-3 border rounded-lg bg-gray-50 focus:bg-white transition-all outline-none"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        {/* ADICIONAR PERGUNTAS */}
        <div className="flex flex-wrap gap-3 p-4 bg-gray-50 rounded-xl border">
          <span className="text-sm font-bold text-gray-700 w-full">
            Adicionar pergunta
          </span>
          <button
            onClick={() => addPergunta("texto")}
            className="bg-white border px-4 py-1.5 rounded-lg text-sm hover:bg-gray-100"
          >
            Texto curto
          </button>
          <button
            onClick={() => addPergunta("texto_longo")}
            className="bg-white border px-4 py-1.5 rounded-lg text-sm hover:bg-gray-100"
          >
            Texto longo
          </button>
          <button
            onClick={() => addPergunta("multipla")}
            className="bg-white border px-4 py-1.5 rounded-lg text-sm hover:bg-gray-100"
          >
            Múltipla escolha
          </button>
        </div>

        {/* PERGUNTAS */}
        <div className="space-y-6">
          {perguntas.map((p, idx) => (
            <div
              key={p.id}
              className="p-5 bg-white border rounded-xl shadow-sm space-y-4"
            >
              <div className="flex justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-gray-800 text-white text-xs px-2 py-0.5 rounded-full">
                      Q{idx + 1}
                    </span>
                    <span className="text-xs font-bold text-gray-400 uppercase">
                      {p.tipo}
                    </span>
                  </div>
                  <input
                    className="w-full border-b border-gray-300 font-medium p-1 outline-none focus:border-green-700"
                    value={p.enunciado}
                    onChange={(e) =>
                      updatePergunta(p.id, "enunciado", e.target.value)
                    }
                    placeholder="Digite o enunciado da pergunta"
                  />
                </div>
                <button
                  onClick={() => removePergunta(p.id)}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  Remover
                </button>
              </div>

              {p.tipo === "multipla" && (
                <div className="p-3 bg-gray-50 rounded-lg border">
                  <label className="text-xs font-bold text-gray-500 uppercase block mb-1">
                    Opções
                  </label>
                  <input
                    className="w-full border p-2 rounded bg-white text-sm"
                    value={(p.opcoes || []).join(", ")}
                    onChange={(e) =>
                      updatePergunta(
                        p.id,
                        "opcoes",
                        e.target.value.split(",")
                      )
                    }
                  />
                </div>
              )}

              {/* PERFIS */}
              <div className="pt-3 border-t">
                <p className="text-xs font-bold text-gray-500 uppercase mb-2">
                  Perfis que respondem
                </p>
                <div className="flex flex-wrap gap-2">
                  {CARGOS_SISTEMA.map((cargo) => {
                    const ativo = p.perfis.includes(cargo);
                    return (
                      <button
                        key={cargo}
                        onClick={() => toggleCargo(p.id, cargo)}
                        className={`text-xs px-3 py-1 rounded-full border transition-all ${
                          ativo
                            ? "bg-green-700 border-green-700 text-white"
                            : "bg-white border-gray-300 text-gray-500 hover:border-gray-500"
                        }`}
                      >
                        {cargo}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* SALVAR */}
        <button
          onClick={salvarFormulario}
          className="w-full bg-green-700 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-800 transition-all"
        >
          {editandoId ? "Atualizar modelo" : "Salvar modelo"}
        </button>
      </section>

      {/* LISTA DE MODELOS */}
      <section className="bg-white p-6 rounded-xl shadow-md border">
        <h3 className="font-bold text-xl mb-6 text-gray-800">
          Modelos disponíveis ({listaFormularios.length})
        </h3>

        <div className="grid gap-4">
          {listaFormularios.map((f) => (
            <div
              key={f.id}
              className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 p-5 border rounded-xl hover:bg-gray-50 transition-all"
            >
              <div>
                <h4 className="font-bold text-gray-800">
                  {f.titulo}
                </h4>
                <p className="text-xs text-gray-500">
                  {f.perguntas.length} questões configuradas
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEditar(f)}
                  className="bg-white border px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 hover:text-white transition-all"
                >
                  Visualizar / Editar
                </button>
                <button
                  onClick={() => handleExcluir(f.id)}
                  className="bg-white border border-red-300 text-red-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 hover:text-white transition-all"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}

          {listaFormularios.length === 0 && (
            <div className="text-center py-10 text-gray-400 border-2 border-dashed rounded-xl">
              Nenhum modelo salvo ainda.
            </div>
          )}
        </div>
      </section>

    </div>
  </div>
);

}