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
    <div className="max-w-5xl mx-auto p-4 space-y-10">
      {/* EDITOR DE FORMULÁRIO */}
      <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-200">
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <h1 className="text-2xl font-bold text-gray-800">
            {editandoId ? "✏️ Editando Modelo" : "📝 Criar Novo Questionário"}
          </h1>
          <button 
            onClick={gerarModeloPadrao} 
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-indigo-700 shadow-md transition-all flex items-center gap-2"
          >
            📄 Carregar Modelo Oficial
          </button>
        </div>

        <div className="grid gap-6 mb-8">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase">Título do Formulário</label>
            <input 
              className="w-full text-xl font-bold border-b-2 border-gray-100 p-2 outline-none focus:border-indigo-500 transition-all" 
              value={titulo} 
              onChange={e => setTitulo(e.target.value)} 
              placeholder="Ex: Conselho de Classe 2026"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase">Descrição/Instruções</label>
            <textarea 
              className="w-full p-3 border rounded-lg bg-gray-50 focus:bg-white transition-all outline-none" 
              value={descricao} 
              onChange={e => setDescricao(e.target.value)} 
              rows={2}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-8 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
          <span className="text-sm font-bold text-indigo-800 w-full mb-1">Adicionar Pergunta:</span>
          <button onClick={() => addPergunta("texto")} className="bg-white border-2 border-indigo-200 px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-100">+ Texto Curto</button>
          <button onClick={() => addPergunta("texto_longo")} className="bg-white border-2 border-indigo-200 px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-100">+ Texto Longo / Alunos</button>
          <button onClick={() => addPergunta("multipla")} className="bg-white border-2 border-indigo-200 px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-100">+ Múltipla Escolha</button>
        </div>

        <div className="space-y-6">
          {perguntas.map((p, idx) => (
            <div key={p.id} className="p-5 bg-white border-2 border-gray-100 rounded-xl shadow-sm hover:border-indigo-200 transition-all relative group">
              <div className="flex justify-between gap-4 mb-5">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-gray-800 text-white text-[10px] px-2 py-0.5 rounded-full">Q{idx + 1}</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">{p.tipo}</span>
                  </div>
                  <input 
                    className="w-full border-b-2 border-transparent font-semibold p-1 outline-none focus:border-indigo-500 text-gray-700" 
                    value={p.enunciado} 
                    onChange={e => updatePergunta(p.id, "enunciado", e.target.value)} 
                    placeholder="Digite o enunciado da pergunta..." 
                  />
                </div>
                <button onClick={() => removePergunta(p.id)} className="text-gray-300 hover:text-red-500 transition-colors">🗑️</button>
              </div>

              {p.tipo === "multipla" && (
                <div className="mb-5 p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <label className="text-[10px] font-bold text-amber-700 uppercase block mb-1">Opções (separe com vírgula)</label>
                  <input 
                    className="w-full border p-2 rounded bg-white text-sm" 
                    value={(p.opcoes || []).join(", ")} 
                    onChange={e => updatePergunta(p.id, "opcoes", e.target.value.split(','))} 
                  />
                </div>
              )}

              <div className="pt-3 border-t border-dashed">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-3">Quem deve responder esta pergunta?</p>
                <div className="flex flex-wrap gap-2">
                  {CARGOS_SISTEMA.map(cargo => {
                    const ativo = p.perfis.includes(cargo);
                    return (
                      <button 
                        key={cargo} 
                        onClick={() => toggleCargo(p.id, cargo)} 
                        className={`text-[10px] px-3 py-1 rounded-full border-2 transition-all font-bold ${ativo ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-300'}`}
                      >
                        {cargo}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={salvarFormulario} 
          className="mt-10 w-full bg-emerald-600 text-white py-4 rounded-xl font-black text-lg hover:bg-emerald-700 shadow-lg transition-all active:scale-[0.98]"
        >
          {editandoId ? "ATUALIZAR MODELO" : "SALVAR MODELO NO SISTEMA"}
        </button>
      </div>

      {/* LISTA DE MODELOS SALVOS */}
      <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
        <h3 className="font-bold text-xl mb-6 text-gray-800 flex items-center gap-2">
          📚 Modelos Disponíveis <span className="text-sm font-normal text-gray-400">({listaFormularios.length})</span>
        </h3>
        <div className="grid gap-4">
          {listaFormularios.map(f => (
            <div key={f.id} className="flex justify-between items-center p-5 border-2 border-gray-50 rounded-xl hover:bg-gray-50 transition-all group">
              <div>
                <h4 className="font-bold text-indigo-900 group-hover:text-indigo-600 transition-colors">{f.titulo}</h4>
                <p className="text-xs text-gray-400">{f.perguntas.length} questões configuradas</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleEditar(f)} 
                  className="bg-white border-2 border-indigo-100 text-indigo-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                >
                  👁️ Visualizar / Editar
                </button>
                <button 
                  onClick={() => handleExcluir(f.id)} 
                  className="bg-white border-2 border-red-50 border-red-50 text-red-400 px-3 py-2 rounded-lg text-xs font-bold hover:bg-red-500 hover:text-white transition-all"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
          {listaFormularios.length === 0 && (
            <div className="text-center py-10 text-gray-400 border-2 border-dashed rounded-xl">
              Nenhum modelo salvo. Use o botão "Carregar Modelo Oficial" acima para começar.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}