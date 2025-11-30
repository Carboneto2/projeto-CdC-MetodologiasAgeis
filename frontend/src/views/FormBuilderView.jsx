import React, { useState, useMemo } from "react";
import { useForms } from "../hooks/useForms";
import { useTurmas } from "../hooks/useTurmas";
import { useAlunos } from "../hooks/useAlunos";
import { modeloConselhoPadrao } from "../data/modeloConselhoPadrao";

import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";
import Textarea from "../components/Textarea";
import Tag from "../components/Tag";
import PerguntaEditor from "../components/PerguntaEditor";

export default function FormBuilderView() {
  const {
    forms,
    addForm,
    removeForm,
    respostas,
    removeResposta,
    addResposta,
  } = useForms();
  
  const { turmas } = useTurmas();
  const { alunos } = useAlunos();

  const [titulo, setTitulo] = useState("Conselho de Classe");
  const [descricao, setDescricao] = useState(
    "Use este formulário para registrar percepções, notas e encaminhamentos."
  );
  const [perguntas, setPerguntas] = useState([]);

  // Estado para o Zoom da Foto (NOVO)
  const [fotoExpandida, setFotoExpandida] = useState(null);

  // --- Carregar Modelo Padrão ---
  const carregarModeloPadrao = () => {
    if (perguntas.length > 0) {
      if (!confirm("Isso vai substituir as perguntas atuais pelo modelo padrão oficial. Continuar?")) return;
    }

    setTitulo(modeloConselhoPadrao.titulo);
    setDescricao(modeloConselhoPadrao.descricao);
    
    const perguntasProcessadas = modeloConselhoPadrao.perguntas.map(p => ({
        ...p,
        id: crypto.randomUUID(),
        opcoes: p.opcoes || [] 
    }));

    setPerguntas(perguntasProcessadas);
  };

  const addPergunta = (tipo) => {
    setPerguntas((x) => [
      ...x,
      {
        id: crypto.randomUUID(),
        tipo,
        enunciado: "",
        opcoes:
          (tipo === "multipla" || tipo === "radio")
            ? ["Opção 1", "Opção 2"]
            : undefined,
        min: tipo === "escala" ? 1 : undefined,
        max: tipo === "escala" ? 5 : undefined,
      },
    ]);
  };

  const salvarFormulario = () => {
    if (!titulo.trim() || perguntas.length === 0)
      return alert("Defina título e ao menos 1 pergunta.");
    addForm({ titulo: titulo.trim(), descricao: descricao.trim(), perguntas });
    setPerguntas([]);
    setTitulo("Conselho de Classe");
    alert("Formulário salvo!");
  };

  const exportar = () => {
    const payload = { turmas, alunos, forms, respostas };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "backup_conselho_classe.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  // --- Preenchimento / Preview ---
  const [fillOpen, setFillOpen] = useState(false);
  const [fillFormId, setFillFormId] = useState("");
  const [fillTurmaId, setFillTurmaId] = useState("");
  const [fill, setFill] = useState({});

  const selectedForm = useMemo(
    () => forms.find((f) => String(f.id) === String(fillFormId)),
    [forms, fillFormId]
  );
  
  const alunosDaTurma = useMemo(
    () => alunos.filter((a) => String(a.turmaId) === String(fillTurmaId)),
    [alunos, fillTurmaId]
  );

  // Checkbox (Múltipla)
  const toggleOption = (perguntaId, opcao) => {
    const selecionados = fill[perguntaId] || [];
    let novos;
    if (selecionados.includes(opcao)) {
      novos = selecionados.filter(item => item !== opcao);
    } else {
      novos = [...selecionados, opcao];
    }
    setFill({ ...fill, [perguntaId]: novos });
  };

  const submitPreenchimento = () => {
    if (!selectedForm || !fillTurmaId)
      return alert("Selecione a turma para continuar.");
      
    addResposta(selectedForm.id, fillTurmaId, null, fill);
    setFillOpen(false);
    setFill({});
    alert("Avaliação da turma registrada!");
  };

  return (
    <div className="space-y-4">
      <Card
        title="Novo formulário de Conselho de Classe"
        subtitle="Construa perguntas personalizadas e salve como modelo."
      >
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <label className="text-sm">Título</label>
              <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} />
            </div>
            <div>
              <label className="text-sm">Descrição</label>
              <Textarea
                rows={2}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2 items-center border-b pb-3 mb-3">
              <button 
                onClick={carregarModeloPadrao}
                className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium border border-blue-200 hover:bg-blue-100 transition-colors"
              >
                ✨ Carregar Modelo Oficial
              </button>
              
              <div className="w-px h-6 bg-gray-300 mx-1"></div>

              <Button className="bg-white border text-xs" onClick={() => addPergunta("texto")}>+ Texto</Button>
              <Button className="bg-white border text-xs" onClick={() => addPergunta("texto_longo")}>+ Longo</Button>
              <Button className="bg-white border text-xs" onClick={() => addPergunta("multipla")}>+ Múltipla</Button>
              <Button className="bg-white border text-xs" onClick={() => addPergunta("radio")}>+ Única (Sim/Não)</Button>
              <Button className="bg-white border text-xs" onClick={() => addPergunta("escala")}>+ Escala</Button>
            </div>

            <div className="space-y-3">
              {perguntas.map((p) => (
                <PerguntaEditor
                  key={p.id}
                  p={p}
                  onChange={(novo) =>
                    setPerguntas((prev) =>
                      prev.map((x) => (x.id === p.id ? novo : x))
                    )
                  }
                  onRemove={() =>
                    setPerguntas((prev) => prev.filter((x) => x.id !== p.id))
                  }
                />
              ))}
              {perguntas.length === 0 && (
                <div className="text-sm text-gray-500 py-4 text-center border-2 border-dashed rounded-xl">
                  Nenhuma pergunta adicionada.<br/>
                  <span className="text-xs">Adicione manualmente ou use o Modelo Padrão acima.</span>
                </div>
              )}
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button className="bg-black text-white w-full md:w-auto" onClick={salvarFormulario}>Salvar formulário</Button>
              <Button className="bg-white border" onClick={exportar}>Backup</Button>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Formulários salvos (Banco de Dados)</h4>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {forms.length === 0 && (
                <div className="text-sm text-gray-500">Nenhum formulário salvo.</div>
              )}
              {forms.map((f) => (
                <div key={f.id} className="border rounded-xl p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{f.titulo}</div>
                      <div className="text-xs text-gray-500">{f.perguntas ? f.perguntas.length : 0} pergunta(s)</div>
                    </div>
                    <div className="flex gap-2">
                      <Button className="bg-white border text-xs px-2" onClick={() => {
                          setTitulo(f.titulo); setDescricao(f.descricao || ""); setPerguntas(f.perguntas || []);
                        }}>Editar</Button>
                      <Button className="bg-red-600 text-white text-xs px-2" onClick={() => removeForm(f.id)}>Excluir</Button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Button
                      className="bg-black text-white w-full text-sm"
                      onClick={() => {
                        setFillFormId(f.id);
                        setFillOpen(true);
                      }}
                    >
                      Preencher / Avaliar Turma
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card title="Respostas registradas" subtitle={`${respostas.length} resposta(s)`}>
        <div className="space-y-3">
          {respostas.length === 0 && <div className="text-sm text-gray-500">Ainda não há respostas.</div>}
          {respostas.map((r) => {
            const form = forms.find((f) => String(f.id) === String(r.formId));
            const turma = turmas.find((t) => String(t.id) === String(r.turmaId));
            
            return (
              <div key={r.id} className="border rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    <strong>{form?.titulo || "Formulário"}</strong> • {turma?.nome || "Turma removida"}
                    <span className="ml-2 text-xs"><Tag>{new Date(r.data).toLocaleString()}</Tag></span>
                  </div>
                  <Button className="bg-white border text-xs" onClick={() => {
                      const blob = new Blob([JSON.stringify(r, null, 2)], { type: "application/json" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url; a.download = `resposta_${r.id}.json`; a.click(); URL.revokeObjectURL(url);
                    }}>JSON</Button>
                </div>
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm font-medium text-blue-600">Ver respostas</summary>
                  <div className="mt-2 grid gap-2 bg-gray-50 p-3 rounded-lg">
                    {r.payload && Object.entries(r.payload).map(([qid, valor]) => {
                      const p = form?.perguntas?.find((pp) => pp.id === qid);
                      const valorExibicao = Array.isArray(valor) ? valor.join(", ") : String(valor);
                      return (
                        <div key={qid} className="text-sm border-b last:border-0 pb-1 mb-1">
                          <div className="font-medium text-gray-700">{p?.enunciado || "Pergunta"}</div>
                          <div className="text-black">{valorExibicao}</div>
                        </div>
                      );
                    })}
                  </div>
                </details>
                <div className="mt-2 text-right">
                  <Button className="bg-white text-red-600 border border-red-200 text-xs" onClick={() => removeResposta(r.id)}>Excluir Resposta</Button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* MODAL DE PREENCHIMENTO */}
      {fillOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold">Avaliação: {selectedForm?.titulo}</h3>
                <p className="text-sm text-gray-500">{selectedForm?.descricao}</p>
              </div>
              <button className="text-gray-500 hover:text-black" onClick={() => setFillOpen(false)}>✕</button>
            </div>
            
            <div className="mb-4 p-4 bg-gray-50 rounded-xl border">
              <label className="text-sm font-medium">Selecione a Turma</label>
              <select
                className="w-full mt-1 rounded-xl border px-3 py-2 bg-white"
                value={fillTurmaId}
                onChange={(e) => setFillTurmaId(e.target.value)}
              >
                <option value="">-- Selecione --</option>
                {turmas.map((t) => (
                  <option key={t.id} value={t.id}>{t.nome}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-6">
              {(selectedForm?.perguntas || []).map((p, index) => (
                <div key={p.id} className="border-b pb-4 last:border-0">
                  <div className="text-base font-medium mb-2 flex gap-2">
                    <span className="text-gray-400">{index + 1}.</span>
                    {p.enunciado || <em className="text-gray-400">(sem enunciado)</em>}
                  </div>
                  
                  {p.tipo === "texto" && (
                    <Input value={fill[p.id] || ""} onChange={(e) => setFill({ ...fill, [p.id]: e.target.value })} placeholder="Sua resposta..." />
                  )}
                  {p.tipo === "texto_longo" && (
                    <Textarea rows={3} value={fill[p.id] || ""} onChange={(e) => setFill({ ...fill, [p.id]: e.target.value })} placeholder="Descreva detalhadamente..." />
                  )}
                  
                  {/* TIPO: MÚLTIPLA ESCOLHA (CHECKBOX) - Com Foto e Zoom */}
                  {p.tipo === "multipla" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(() => {
                        const isDynamic = !p.opcoes || p.opcoes.length === 0;
                        const optionsList = isDynamic ? alunosDaTurma.map(a => a.nome) : p.opcoes;
                        
                        if (isDynamic && optionsList.length === 0) {
                            return <div className="text-red-500 text-sm italic col-span-2 bg-red-50 p-2 rounded">
                                {fillTurmaId ? "Nenhum aluno cadastrado nesta turma." : "⚠️ Selecione uma turma acima."}
                            </div>;
                        }

                        return optionsList.map((op) => {
                          const isSelected = (fill[p.id] || []).includes(op);
                          const alunoEncontrado = isDynamic ? alunosDaTurma.find(a => a.nome === op) : null;

                          return (
                            <label key={op} className={`flex items-center gap-3 p-2 rounded-lg border transition-all ${isSelected ? "bg-black text-white border-black" : "hover:bg-gray-50"}`}>
                              <input type="checkbox" className="hidden" checked={isSelected} onChange={() => toggleOption(p.id, op)} />
                              
                              <div className={`w-4 h-4 min-w-[1rem] rounded border flex items-center justify-center cursor-pointer ${isSelected ? "border-white bg-white" : "border-gray-400"}`}>
                                {isSelected && <span className="text-black text-xs font-bold">✓</span>}
                              </div>

                              {/* FOTO com Zoom (Aqui está a mágica) */}
                              {alunoEncontrado && (
                                 alunoEncontrado.foto_url ? 
                                   <img 
                                        src={alunoEncontrado.foto_url} 
                                        alt="" 
                                        className="w-8 h-8 rounded-full object-cover border border-gray-200 cursor-zoom-in hover:scale-110 transition-transform" 
                                        onClick={(e) => {
                                            e.preventDefault(); // Evita marcar o checkbox ao clicar na foto
                                            setFotoExpandida(alunoEncontrado.foto_url);
                                        }}
                                   /> 
                                   : <div className="w-8 h-8 min-w-[2rem] rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500">{alunoEncontrado.nome.charAt(0)}</div>
                              )}

                              <span className="text-sm leading-tight cursor-pointer">{op}</span>
                            </label>
                          );
                        })})()}
                    </div>
                  )}

                  {/* TIPO: RADIO (ÚNICA ESCOLHA) */}
                  {p.tipo === "radio" && (
                    <div className="flex gap-4">
                      {(p.opcoes || ["Sim", "Não"]).map((op) => (
                        <label key={op} className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-full border transition-all ${fill[p.id] === op ? "bg-blue-600 text-white border-blue-600" : "bg-white hover:bg-gray-50"}`}>
                          <input type="radio" name={p.id} className="hidden" checked={fill[p.id] === op} onChange={() => setFill({ ...fill, [p.id]: op })} />
                          <div className={`w-4 h-4 rounded-full border ${fill[p.id] === op ? "border-white bg-white" : "border-gray-400"}`}></div>
                          {op}
                        </label>
                      ))}
                    </div>
                  )}

                  {p.tipo === "escala" && (
                    <div className="flex items-center gap-2 flex-wrap">
                      {Array.from({ length: (p.max ?? 5) - (p.min ?? 1) + 1 }, (_, i) => (p.min ?? 1) + i).map((v) => (
                        <label key={v} className={`flex flex-col items-center justify-center w-10 h-10 rounded-full border cursor-pointer transition-all ${fill[p.id] === v ? "bg-black text-white border-black scale-110" : "hover:bg-gray-100"}`}>
                          <input type="radio" name={p.id} className="hidden" checked={fill[p.id] === v} onChange={() => setFill({ ...fill, [p.id]: v })} />
                          <span className="font-bold">{v}</span>
                        </label>
                      ))}
                      <div className="w-full flex justify-between text-xs text-gray-400 px-1 mt-1"><span>Pior</span><span>Melhor</span></div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t flex justify-end gap-3 bg-white">
              <Button className="bg-white border text-gray-700" onClick={() => window.print()}>🖨️ Imprimir</Button>
              <Button className="bg-black text-white px-6 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all" onClick={submitPreenchimento}>✅ Enviar Avaliação</Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE ZOOM DA FOTO (NOVO) */}
      {fotoExpandida && (
        <div 
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 cursor-zoom-out"
            onClick={() => setFotoExpandida(null)}
        >
            <div className="relative max-w-3xl max-h-full">
                <img 
                    src={fotoExpandida} 
                    alt="Foto do Aluno Expandida" 
                    className="max-w-full max-h-[90vh] rounded-lg shadow-2xl border-4 border-white"
                />
                <button 
                    className="absolute -top-4 -right-4 bg-white text-black rounded-full w-8 h-8 flex items-center justify-center font-bold shadow-lg hover:bg-gray-200"
                    onClick={() => setFotoExpandida(null)}
                >
                    ✕
                </button>
            </div>
        </div>
      )}
    </div>
  );
}