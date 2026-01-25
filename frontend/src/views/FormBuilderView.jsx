import React, { useState, useEffect } from "react";
import { generateId } from "../lib/storage";

// Lista de Cargos para os Checkboxes
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
  // --- ESTADOS ---
  const [titulo, setTitulo] = useState("Conselho de Classe — Modelo Novo");
  const [descricao, setDescricao] = useState("Descrição do formulário...");
  const [perguntas, setPerguntas] = useState([]);
  
  const [listaFormularios, setListaFormularios] = useState([]);
  const [editandoId, setEditandoId] = useState(null); // Para saber se estamos criando ou editando
  
  // Estados de Visualização (Modal)
  const [previewOpen, setPreviewOpen] = useState(false);
  const [formPreview, setFormPreview] = useState(null);

  // --- 1. CARREGAR DO BANCO ---
  const carregarFormularios = async () => {
    try {
      const res = await fetch('http://localhost:5000/formularios');
      if (res.ok) setListaFormularios(await res.json());
    } catch (error) { console.error(error); }
  };
  
  useEffect(() => { carregarFormularios(); }, []);

  // --- 2. MODELO OFICIAL (RESTAURADO) ---
  const gerarModeloPadrao = () => {
    if (perguntas.length > 0 && !window.confirm("Isso substituirá suas perguntas atuais. Continuar?")) return;

    setTitulo("Conselho de Classe — Modelo Oficial");
    setDescricao("Análise completa da turma: Docente, NAE, NAPNE, NEABI e NEPGES.");
    
    // Lista de perguntas padrão (agora com perfis incluídos!)
    const todasPermissoes = [...CARGOS_SISTEMA];
    
    setPerguntas([
      { id: generateId(), tipo: "texto_longo", enunciado: "Fragilidades e positividades da turma (Visão Geral)", perfis: todasPermissoes },
      { id: generateId(), tipo: "multipla", enunciado: "Quais são as POTENCIALIDADES da turma?", opcoes: ["Engajamento", "Respeito", "Participação", "Notas Boas"], perfis: todasPermissoes },
      { id: generateId(), tipo: "multipla", enunciado: "Quais são as FRAGILIDADES da turma?", opcoes: ["Conversas", "Faltas", "Desinteresse", "Dificuldade Técnica"], perfis: todasPermissoes },
      { id: generateId(), tipo: "texto_longo", enunciado: "Relação de Estudantes DESTAQUES (Cite os nomes):", perfis: todasPermissoes },
      { id: generateId(), tipo: "texto_longo", enunciado: "Relação de Estudantes INFREQUENTES (Cite os nomes):", perfis: todasPermissoes },
      // Exemplo de pergunta específica
      { id: generateId(), tipo: "texto_longo", enunciado: "Parecer do Psicólogo (NAE):", perfis: ["NAE - Atendimento Psicológico", "Coordenador"] },
    ]);
  };

  // --- 3. MANIPULAÇÃO DAS PERGUNTAS ---
  const addPergunta = (tipo) => {
    setPerguntas((prev) => [
      ...prev,
      {
        id: generateId(),
        tipo,
        enunciado: "",
        opcoes: tipo === "multipla" ? ["Sim", "Não"] : undefined,
        perfis: [...CARGOS_SISTEMA] // Nasce visível para todos
      },
    ]);
  };

  const removePergunta = (id) => {
    setPerguntas(prev => prev.filter(p => p.id !== id));
  };

  const updatePergunta = (id, campo, valor) => {
    setPerguntas(prev => prev.map(p => p.id === id ? { ...p, [campo]: valor } : p));
  };

  const toggleCargoPergunta = (idPergunta, cargo) => {
    setPerguntas(prev => prev.map(p => {
        if (p.id !== idPergunta) return p;
        const perfis = p.perfis || [];
        const novos = perfis.includes(cargo) ? perfis.filter(c => c !== cargo) : [...perfis, cargo];
        return { ...p, perfis: novos };
    }));
  };

  // --- 4. AÇÕES (Salvar, Editar, Excluir, Visualizar) ---

  const salvarFormulario = async () => {
    if (!titulo.trim() || perguntas.length === 0) return alert("Preencha título e perguntas.");

    // Se estiver editando, poderíamos fazer um PUT, mas por simplificação vamos criar novo ou deletar antigo.
    // Aqui manteremos o POST (Criar Novo) como padrão do Admin.
    
    try {
        const res = await fetch('http://localhost:5000/formularios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ titulo, descricao, perguntas })
        });

        if (res.ok) {
            alert("✅ Salvo com sucesso!");
            setTitulo("Novo Modelo");
            setDescricao("");
            setPerguntas([]);
            setEditandoId(null);
            carregarFormularios();
        }
    } catch (e) { alert("Erro de conexão."); }
  };

  // Carrega os dados para os inputs lá de cima
  const handleEditar = (form) => {
      setTitulo(form.titulo);
      setDescricao(form.descricao || "");
      setPerguntas(form.perguntas);
      setEditandoId(form.id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExcluir = async (id) => {
      if(window.confirm("Tem certeza que deseja apagar este formulário?")) {
          await fetch(`http://localhost:5000/formularios/${id}`, { method: 'DELETE' });
          carregarFormularios();
      }
  };

  const handleVisualizar = (form) => {
      setFormPreview(form);
      setPreviewOpen(true);
  };

  return (
    <div className="space-y-6 p-4">
      
      {/* --- ÁREA DE EDIÇÃO (TOPO) --- */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{editandoId ? "✏️ Editando Modelo" : "📝 Criar Novo Modelo"}</h2>
            <button onClick={gerarModeloPadrao} className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded border border-blue-200 hover:bg-blue-200">
                📄 Carregar Modelo Oficial
            </button>
        </div>
        
        <div className="space-y-4 mb-6">
            <input className="w-full p-2 border rounded font-bold text-lg" value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Título do Formulário" />
            <textarea className="w-full p-2 border rounded" value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Descrição" rows={2} />
        </div>

        {/* BARRA DE FERRAMENTAS */}
        <div className="flex gap-2 mb-6 bg-gray-50 p-3 rounded border">
            <span className="text-sm font-bold pt-1 uppercase text-gray-500 mr-2">Adicionar:</span>
            <button onClick={() => addPergunta("texto")} className="px-3 py-1 bg-white border rounded hover:bg-gray-100 shadow-sm">+ Curto</button>
            <button onClick={() => addPergunta("texto_longo")} className="px-3 py-1 bg-white border rounded hover:bg-gray-100 shadow-sm">+ Longo</button>
            <button onClick={() => addPergunta("multipla")} className="px-3 py-1 bg-white border rounded hover:bg-gray-100 shadow-sm">+ Múltipla</button>
        </div>

        {/* LISTA DE PERGUNTAS */}
        <div className="space-y-6">
            {perguntas.length === 0 && <p className="text-center text-gray-400 py-4">Nenhuma pergunta adicionada.</p>}
            
            {perguntas.map((p, index) => (
                <div key={p.id} className="bg-white p-4 rounded border border-gray-300 shadow-sm relative group hover:border-blue-400 transition">
                    <span className="absolute left-[-25px] top-2 font-bold text-gray-400">{index + 1}.</span>
                    
                    {/* Cabeçalho */}
                    <div className="flex justify-between items-start mb-3 gap-4">
                        <div className="flex-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Enunciado</label>
                            <input 
                                className="w-full border-b border-gray-300 p-1 focus:border-black outline-none font-medium"
                                value={p.enunciado}
                                onChange={(e) => updatePergunta(p.id, "enunciado", e.target.value)}
                                placeholder="Digite a pergunta..."
                            />
                        </div>
                        <button onClick={() => removePergunta(p.id)} className="text-red-500 hover:text-red-700 text-xs font-bold border border-red-100 px-2 py-1 rounded bg-red-50">EXCLUIR</button>
                    </div>

                    {/* Opções (Múltipla) */}
                    {p.tipo === "multipla" && (
                        <div className="mb-3 bg-yellow-50 p-2 rounded border border-yellow-100">
                            <label className="text-xs font-bold text-yellow-800">Opções (separadas por vírgula)</label>
                            <input 
                                className="w-full border p-1 rounded bg-white text-sm"
                                value={(p.opcoes || []).join(", ")}
                                onChange={(e) => updatePergunta(p.id, "opcoes", e.target.value.split(','))}
                            />
                        </div>
                    )}

                    {/* SELETOR DE CARGOS */}
                    <div className="border-t pt-2 mt-2">
                        <div className="text-xs font-bold text-blue-800 uppercase mb-2 flex items-center gap-2">
                            🔒 Quem responde? <span className="text-gray-400 font-normal normal-case">(Selecione os cargos)</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-blue-50 p-3 rounded">
                            {CARGOS_SISTEMA.map(cargo => {
                                const checked = (p.perfis || []).includes(cargo);
                                return (
                                    <label key={cargo} className={`flex items-center gap-2 text-[11px] cursor-pointer select-none ${checked ? 'font-bold text-blue-900' : 'text-gray-500 opacity-70'}`}>
                                        <input 
                                            type="checkbox" 
                                            checked={checked} 
                                            onChange={() => toggleCargoPergunta(p.id, cargo)}
                                            className="accent-blue-600"
                                        />
                                        {cargo}
                                    </label>
                                )
                            })}
                        </div>
                        {(p.perfis || []).length === 0 && <p className="text-xs text-red-600 mt-1 font-bold">⚠️ Atenção: Ninguém verá esta pergunta.</p>}
                    </div>
                </div>
            ))}
        </div>

        <div className="mt-6 flex justify-end gap-2 border-t pt-4">
            {editandoId && (
                <button onClick={() => { setEditandoId(null); setTitulo("Novo Modelo"); setPerguntas([]); }} className="bg-gray-200 text-gray-700 px-4 py-2 rounded">
                    Cancelar Edição
                </button>
            )}
            <button onClick={salvarFormulario} className="bg-black text-white px-6 py-2 rounded font-bold hover:bg-gray-800 shadow-lg">
                {editandoId ? "Salvar Como Novo" : "Salvar Modelo"}
            </button>
        </div>
      </div>

      {/* --- LISTA DE MODELOS SALVOS (BAIXO) --- */}
      <div className="bg-white p-6 rounded-lg shadow-md border mt-8">
          <h3 className="font-bold text-lg mb-4 text-gray-800 border-b pb-2">Modelos Disponíveis no Banco</h3>
          
          {listaFormularios.length === 0 ? <p className="text-gray-500 italic">Nenhum modelo salvo.</p> : (
            <div className="grid gap-3">
              {listaFormularios.map(f => (
                  <div key={f.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded hover:bg-gray-50 transition">
                      <div className="mb-2 md:mb-0">
                          <div className="font-bold text-blue-900 text-lg">{f.titulo}</div>
                          <div className="text-sm text-gray-500">{f.descricao}</div>
                          <div className="text-xs text-gray-400 mt-1">{f.perguntas.length} questões</div>
                      </div>
                      
                      <div className="flex gap-2">
                          <button onClick={() => handleVisualizar(f)} className="px-3 py-1 bg-white border border-gray-300 rounded text-gray-600 hover:bg-gray-100 text-sm flex items-center gap-1">
                              👁️ <span className="hidden md:inline">Visualizar</span>
                          </button>
                          
                          <button onClick={() => handleEditar(f)} className="px-3 py-1 bg-blue-50 border border-blue-200 rounded text-blue-600 hover:bg-blue-100 text-sm flex items-center gap-1">
                              ✏️ <span className="hidden md:inline">Editar</span>
                          </button>
                          
                          <button onClick={() => handleExcluir(f.id)} className="px-3 py-1 bg-red-50 border border-red-200 rounded text-red-600 hover:bg-red-100 text-sm">
                              🗑️
                          </button>
                      </div>
                  </div>
              ))}
            </div>
          )}
      </div>

      {/* --- MODAL DE VISUALIZAÇÃO/TESTE --- */}
      {previewOpen && formPreview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
                    <h3 className="font-bold text-lg">Visualizando: {formPreview.titulo}</h3>
                    <button onClick={() => setPreviewOpen(false)} className="text-xl font-bold text-gray-500 hover:text-black">✕</button>
                </div>
                
                <div className="p-6 space-y-6">
                    {formPreview.perguntas.map((p, idx) => (
                        <div key={idx} className="border-b pb-4">
                            <p className="font-bold text-gray-800 mb-1">{idx + 1}. {p.enunciado}</p>
                            <p className="text-xs text-blue-600 mb-2">
                                🔒 Visível para: {(p.perfis || []).join(", ")}
                            </p>
                            
                            {p.tipo === 'texto' && <input disabled className="w-full border p-2 rounded bg-gray-100" placeholder="Resposta..." />}
                            {p.tipo === 'texto_longo' && <textarea disabled className="w-full border p-2 rounded bg-gray-100" rows={2} placeholder="Resposta longa..." />}
                            {p.tipo === 'multipla' && (
                                <div className="flex gap-4">
                                    {p.opcoes?.map(op => (
                                        <div key={op} className="flex items-center gap-1">
                                            <input type="checkbox" disabled /> 
                                            <span className="text-gray-500">{op}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t bg-gray-50 text-right rounded-b-xl">
                    <button onClick={() => setPreviewOpen(false)} className="bg-black text-white px-4 py-2 rounded">Fechar</button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}