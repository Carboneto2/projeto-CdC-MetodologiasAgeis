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

  // --- Função para Carregar Modelo Padrão ---
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
          tipo === "multipla"
            ? ["Ótimo", "Bom", "Regular", "Insuficiente"]
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
  // REMOVIDO: const [fillAlunoId, setFillAlunoId] = useState(""); (Não precisamos mais selecionar aluno no topo)
  const [fill, setFill] = useState({});

  const selectedForm = useMemo(
    () => forms.find((f) => String(f.id) === String(fillFormId)),
    [forms, fillFormId]
  );
  
  // Usado para preencher as opções dinâmicas das perguntas
  const alunosDaTurma = useMemo(
    () => alunos.filter((a) => String(a.turmaId) === String(fillTurmaId)),
    [alunos, fillTurmaId]
  );

  const submitPreenchimento = () => {
    // ALTERADO: Não exige mais fillAlunoId
    if (!selectedForm || !fillTurmaId)
      return alert("Selecione a turma para continuar.");
      
    // Envia null como alunoId, pois é um relatório da turma
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

              <Button className="bg-white border text-xs" onClick={() => addPergunta("texto")}>
                + Texto
              </Button>
              <Button className="bg-white border text-xs" onClick={() => addPergunta("texto_longo")}>
                + Longo
              </Button>
              <Button className="bg-white border text-xs" onClick={() => addPergunta("multipla")}>
                + Múltipla
              </Button>
              <Button className="bg-white border text-xs" onClick={() => addPergunta("escala")}>
                + Escala
              </Button>
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
              <Button className="bg-black text-white w-full md:w-auto" onClick={salvarFormulario}>
                Salvar formulário
              </Button>
              <Button className="bg-white border" onClick={exportar}>
                Backup
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Formulários salvos (Banco de Dados)</h4>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {forms.length === 0 && (
                <div className="text-sm text-gray-500">
                  Nenhum formulário salvo.
                </div>
              )}
              {forms.map((f) => (
                <div key={f.id} className="border rounded-xl p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{f.titulo}</div>
                      <div className="text-xs text-gray-500">
                        {f.perguntas ? f.perguntas.length : 0} pergunta(s)
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button className="bg-white border text-xs px-2" onClick={() => {
                          setTitulo(f.titulo);
                          setDescricao(f.descricao || "");
                          setPerguntas(f.perguntas || []);
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
            
            // Lógica para exibir nome do aluno OU "Relatório Geral"
            let etiquetaAluno = "Relatório Geral da Turma";
            if (r.alunoId) {
                const aluno = alunos.find((a) => String(a.id) === String(r.alunoId));
                etiquetaAluno = aluno ? `Aluno: ${aluno.nome}` : "Aluno removido";
            }
            
            return (
              <div key={r.id} className="border rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    <strong>{form?.titulo || "Formulário"}</strong> • {turma?.nome || "Turma removida"} • <span className="font-medium text-black">{etiquetaAluno}</span>
                    <span className="ml-2 text-xs">
                      <Tag>{new Date(r.data).toLocaleString()}</Tag>
                    </span>
                  </div>
                  <Button
                    className="bg-white border text-xs"
                    onClick={() => {
                      const blob = new Blob([JSON.stringify(r, null, 2)], { type: "application/json" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url; a.download = `resposta_${r.id}.json`; a.click(); URL.revokeObjectURL(url);
                    }}
                  >
                    JSON
                  </Button>
                </div>
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm font-medium text-blue-600">Ver respostas</summary>
                  <div className="mt-2 grid gap-2 bg-gray-50 p-3 rounded-lg">
                    {r.payload && Object.entries(r.payload).map(([qid, valor]) => {
                      const p = form?.perguntas?.find((pp) => pp.id === qid);
                      return (
                        <div key={qid} className="text-sm border-b last:border-0 pb-1 mb-1">
                          <div className="font-medium text-gray-700">{p?.enunciado || "Pergunta"}</div>
                          <div className="text-black">{String(valor)}</div>
                        </div>
                      );
                    })}
                  </div>
                </details>
                <div className="mt-2 text-right">
                  <Button className="bg-white text-red-600 border border-red-200 text-xs" onClick={() => removeResposta(r.id)}>
                    Excluir Resposta
                  </Button>
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
                <h3 className="text-xl font-bold">Avaliação da Turma: {selectedForm?.titulo}</h3>
                <p className="text-sm text-gray-500">{selectedForm?.descricao}</p>
              </div>
              <button className="text-gray-500 hover:text-black" onClick={() => setFillOpen(false)}>✕</button>
            </div>
            
            {/* APENAS SELEÇÃO DE TURMA AGORA */}
            <div className="mb-4 p-4 bg-gray-50 rounded-xl border">
              <label className="text-sm font-medium">Selecione a Turma a ser avaliada</label>
              <select
                className="w-full mt-1 rounded-xl border px-3 py-2 bg-white"
                value={fillTurmaId}
                onChange={(e) => {
                  setFillTurmaId(e.target.value);
                  // Não limpamos fillAlunoId pq ele não existe mais
                }}
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
                  {p.tipo === "multipla" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(() => {
                        // LÓGICA DINÂMICA (MANTIDA):
                        const isDynamic = !p.opcoes || p.opcoes.length === 0;
                        const optionsList = isDynamic ? alunosDaTurma.map(a => a.nome) : p.opcoes;
                        
                        if (isDynamic && optionsList.length === 0) {
                            return <div className="text-red-500 text-sm italic col-span-2 bg-red-50 p-2 rounded">
                                {fillTurmaId ? "Nenhum aluno nesta turma." : "⚠️ Selecione uma turma acima para carregar a lista de alunos."}
                            </div>;
                        }

                        return optionsList.map((op) => (
                        <label key={op} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${fill[p.id] === op ? "bg-black text-white border-black" : "hover:bg-gray-50"}`}>
                          <input type="radio" name={p.id} className="hidden" checked={fill[p.id] === op} onChange={() => setFill({ ...fill, [p.id]: op })} />
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${fill[p.id] === op ? "border-white" : "border-gray-400"}`}>
                            {fill[p.id] === op && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                          {op}
                        </label>
                      ))})()}
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
    </div>
  );
}