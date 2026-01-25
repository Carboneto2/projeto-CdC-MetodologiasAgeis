import React, { useState, useMemo } from "react";
import { useForms } from "../hooks/useForms";
import { useTurmas } from "../hooks/useTurmas";
import { useAlunos } from "../hooks/useAlunos";
import { LS_KEYS, writeLS, generateId } from "../lib/storage";

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
    updateForm,
    removeForm,
    respostas,
    removeResposta,
    addResposta,
  } = useForms();
  const { turmas } = useTurmas();
  const { alunos } = useAlunos();

  const [titulo, setTitulo] = useState("Conselho de Classe — Formulário padrão");
  const [descricao, setDescricao] = useState(
    "Use este formulário para registrar percepções, notas e encaminhamentos."
  );
  const [perguntas, setPerguntas] = useState([]);

  // Estado para foto expandida (Zoom)
  const [zoomFoto, setZoomFoto] = useState(null);

  // Função auxiliar para identificar perguntas que citam alunos
  const isStudentCitingQuestion = (enunciado) => {
    // Verifica se a pergunta tem o padrão "(Cite os nomes):" ou é uma das exceções
    return enunciado.includes('(Cite os nomes):') || 
           enunciado.includes('Quais estudantes foram atendidos') || 
           enunciado.includes('Quais estudantes NÃO atingiram');
  };

  // --- MODELO OFICIAL ---
  const gerarModeloPadrao = () => {
    if (perguntas.length > 0 && !window.confirm("Isso substituirá suas perguntas atuais. Continuar?")) {
      return;
    }

    setTitulo("Conselho de Classe — Modelo Oficial");
    setDescricao("Análise completa da turma: Docente, NAE, NAPNE, NEABI e NEPGES.");
    
    setPerguntas([
      { id: generateId(), tipo: "texto_longo", enunciado: "Fragilidades e positividades existentes na turma e proposições/soluções (Visão Coordenador):" },
      { id: generateId(), tipo: "texto", enunciado: "Disciplina:" },
      {
        id: generateId(), tipo: "multipla", enunciado: "Em sua opinião, quais são as POTENCIALIDADES da turma?",
        opcoes: ["Engajamento dos Alunos", "Colaboração", "Participação em Discussões", "Respeito Mútuo", "Alunos Motivados", "Foco na Melhoria", "Resiliência", "Participação em Atividades Extracurriculares", "Comunicação Eficaz", "Iniciativa", "Habilidade de Resolução de Conflitos", "Aceitação da Diversidade", "Frequência às Aulas", "Aproveitamento do Tempo de Estudo", "Atenção às Normas e Regulamentos", "Habilidades de Autodireção", "Participação dos Pais/Responsáveis", "Outro (descrever nas observações)"]
      },
      {
        id: generateId(), tipo: "multipla", enunciado: "Em sua opinião, quais são as FRAGILIDADES da turma?",
        opcoes: ["Baixo Envolvimento dos Alunos", "Dificuldade na Colaboração", "Participação Limitada em Discussões", "Falta de Respeito Mútuo", "Falta de Motivação", "Dificuldade em Aceitar Feedback", "Fragilidade Diante de Desafios", "Baixa Participação em Atividades Extracurriculares", "Comunicação Ineficaz", "Frequência Irregular às Aulas", "Procrastinação", "Desrespeito às Normas e Regulamentos", "Necessidade de Apoio", "Falta de Autodireção", "Pouco Envolvimento dos Pais/Responsáveis", "Conversas paralelas", "Outro (descrever nas observações)"]
      },
      // Perguntas de citação de aluno (transformadas em multi-select de nomes)
      { id: generateId(), tipo: "texto_longo", enunciado: "Relação de Estudantes DESTAQUES (Cite os nomes):" },
      { id: generateId(), tipo: "texto_longo", enunciado: "Relação de Estudantes INFREQUENTES (Cite os nomes):" },
      { id: generateId(), tipo: "texto_longo", enunciado: "Discentes com MAIORES DIFICULDADES de aprendizagem (Cite os nomes):" },
      { id: generateId(), tipo: "texto_longo", enunciado: "Detalhe as dificuldades (se achar conveniente):" }, // Campo de texto normal
      { id: generateId(), tipo: "texto_longo", enunciado: "Quais estudantes NÃO atingiram a média no trimestre? (Cite os nomes):" },
      { id: generateId(), tipo: "texto_longo", enunciado: "Sugestão para encaminhamento ao APOIO PSICOLÓGICO (Cite os nomes):" },
      { id: generateId(), tipo: "texto_longo", enunciado: "NAE: Quais estudantes foram atendidos pelos serviços de apoio psicológico?" },
      { id: generateId(), tipo: "texto_longo", enunciado: "NAE: Qual o tipo de atendimento ofertado?" }, // Campo de texto normal
      { id: generateId(), tipo: "texto_longo", enunciado: "NAE: Discentes atendidos pelo SERVIÇO SOCIAL (Cite os nomes):" },
      { id: generateId(), tipo: "texto_longo", enunciado: "NAE: Qual o tipo de atendimento necessário (Serviço Social)?" }, // Campo de texto normal
      { id: generateId(), tipo: "texto_longo", enunciado: "Considerações do ASSISTENTE DE ALUNO:" }, // Campo de texto normal
      { id: generateId(), tipo: "texto_longo", enunciado: "NAPNE: Relação de discentes com necessidades específicas (descrever tipo de atendimento):" }, // Campo de texto normal
      // Perguntas de Sim/Não (Múltipla Escolha)
      { id: generateId(), tipo: "multipla", enunciado: "NEABI: Houve ações para promover a discussão das relações étnico-raciais com a turma?", opcoes: ["Sim", "Não"] },
      { id: generateId(), tipo: "texto_longo", enunciado: "NEABI: Se sim, relate as ações:" }, // Campo de texto normal
      { id: generateId(), tipo: "multipla", enunciado: "NEPGES: Houve ações para promover a discussão sobre gênero e sexualidade com a turma?", opcoes: ["Sim", "Não"] },
      { id: generateId(), tipo: "texto_longo", enunciado: "NEPGES: Se sim, relate as ações:" }, // Campo de texto normal
    ]);
    alert("Modelo Oficial carregado com sucesso!");
  };

  const addPergunta = (tipo) => {
    setPerguntas((x) => [
      ...x,
      {
        id: generateId(),
        tipo,
        enunciado: "",
        opcoes: tipo === "multipla" ? ["Opção 1", "Opção 2"] : undefined,
        min: tipo === "escala" ? 1 : undefined,
        max: tipo === "escala" ? 5 : undefined,
      },
    ]);
  };

  const salvarFormulario = () => {
    if (!titulo.trim() || perguntas.length === 0)
      return alert("Defina título e ao menos 1 pergunta.");
    
    addForm({ titulo: titulo.trim(), descricao: descricao.trim(), perguntas });
    setTitulo("Conselho de Classe — Formulário padrão");
    setDescricao("");
    setPerguntas([]);
    alert("Formulário salvo com sucesso!");
  };

  const handleExcluirForm = (id) => {
    if(window.confirm("Deseja realmente excluir este formulário?")) {
        removeForm(id);
    }
  }

  const exportar = () => {
    const payload = { turmas, alunos, forms, respostas };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "backup_conselho_classe.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importar = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = JSON.parse(reader.result);
        if (json.turmas && json.alunos && json.forms && json.respostas) {
          writeLS(LS_KEYS.TURMAS, json.turmas);
          writeLS(LS_KEYS.ALUNOS, json.alunos);
          writeLS(LS_KEYS.FORMS, json.forms);
          writeLS(LS_KEYS.RESPOSTAS, json.respostas);
          alert("Importação concluída. Recarregue a página.");
        } else {
          alert("Arquivo inválido");
        }
      } catch (e) {
        alert("Erro ao importar");
      }
    };
    reader.readAsText(file);
  };

  // Preenchimento
  const [fillOpen, setFillOpen] = useState(false);
  const [fillFormId, setFillFormId] = useState("");
  const [fillTurmaId, setFillTurmaId] = useState("");
  const [fill, setFill] = useState({});

  const selectedForm = useMemo(
    () => forms.find((f) => f.id === fillFormId),
    [forms, fillFormId]
  );
  
  const alunosDaTurma = useMemo(
    () => alunos.filter((a) => a.turmaId === fillTurmaId),
    [alunos, fillTurmaId]
  );

  const submitPreenchimento = () => {
    if (!selectedForm || !fillTurmaId)
      return alert("Selecione a turma para enviar.");
    
    const payload = {};
    for (const [key, value] of Object.entries(fill)) {
        const question = selectedForm.perguntas.find(p => p.id === key);

        if (!question) continue; // Pula se a pergunta não for encontrada

        if (isStudentCitingQuestion(question.enunciado) && Array.isArray(value)) {
            // Se for citação de aluno, converte o array de nomes para uma string formatada para visualização
            payload[key] = value.map(name => `- ${name}`).join('\n');
        } else if (question.tipo === 'multipla' && Array.isArray(value)) {
            // Se for múltipla escolha (multi-seleção), une com vírgula para visualização
            payload[key] = value.join(', ');
        } else {
            payload[key] = value;
        }
    }
    
    // AlunoID é null (ou undefined) pois o form é da turma
    addResposta(selectedForm.id, fillTurmaId, null, payload);
    setFillOpen(false);
    setFill({});
    setFillTurmaId("");
    alert("Resposta registrada com sucesso!");
  };


  // Componente de preenchimento (Modal)
  return (
    <div className="space-y-4">
      <Card title="Novo formulário" subtitle="Construa perguntas personalizadas.">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <label className="text-sm">Título</label>
              <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} />
            </div>
            <div>
              <label className="text-sm">Descrição</label>
              <Textarea rows={2} value={descricao} onChange={(e) => setDescricao(e.target.value)} />
            </div>
            
            <div className="flex flex-wrap gap-2 items-center">
               <span className="text-xs font-semibold text-gray-500 uppercase mr-2">Adicionar:</span>
              <Button className="bg-white border text-xs" onClick={() => addPergunta("texto")}>+ Curto</Button>
              <Button className="bg-white border text-xs" onClick={() => addPergunta("texto_longo")}>+ Longo</Button>
              <Button className="bg-white border text-xs" onClick={() => addPergunta("multipla")}>+ Múltipla</Button>
              <Button className="bg-white border text-xs" onClick={() => addPergunta("escala")}>+ Escala</Button>
            </div>

            <div className="space-y-3 border-t pt-3">
              {perguntas.map((p) => (
                <PerguntaEditor
                  key={p.id}
                  p={p}
                  onChange={(novo) => setPerguntas((prev) => prev.map((x) => (x.id === p.id ? novo : x)))}
                  onRemove={() => setPerguntas((prev) => prev.filter((x) => x.id !== p.id))}
                />
              ))}
              {perguntas.length === 0 && (
                <div className="text-sm text-gray-500 italic py-4 text-center border-2 border-dashed rounded-xl">
                  Nenhuma pergunta.<br/>Use o modelo oficial abaixo.
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 border-t pt-3">
              <Button className="bg-black text-white" onClick={salvarFormulario}>Salvar</Button>
              <Button className="bg-blue-600 text-white" onClick={gerarModeloPadrao}>Carregar Modelo Oficial</Button>
              <div className="flex gap-2 ml-auto">
                <Button className="bg-white border" onClick={exportar}>Backup</Button>
                <label className="bg-white border px-4 py-2 rounded-2xl shadow cursor-pointer text-sm flex items-center hover:bg-gray-50">
                    Importar <input type="file" accept="application/json" className="hidden" onChange={(e) => e.target.files?.[0] && importar(e.target.files[0])} />
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Formulários salvos</h4>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {forms.map((f) => (
                <div key={f.id} className="border rounded-xl p-3 bg-gray-50">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{f.titulo}</div>
                      <div className="text-xs text-gray-500">{f.perguntas.length} pergunta(s)</div>
                    </div>
                    <div className="flex gap-1">
                      <Button className="bg-white border text-xs px-2" onClick={() => { setTitulo(f.titulo); setDescricao(f.descricao || ""); setPerguntas(f.perguntas); }}>Editar</Button>
                      <Button className="bg-red-100 text-red-700 border border-red-200 text-xs px-2" onClick={() => handleExcluirForm(f.id)}>Excluir</Button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Button className="bg-black text-white w-full text-sm" onClick={() => { setFillFormId(f.id); setFillOpen(true); }}>Preencher este formulário</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card title="Respostas registradas" subtitle={`${respostas.length} resposta(s)`}>
        <div className="space-y-3">
          {respostas.length === 0 && <div className="text-sm text-gray-500">Nenhuma resposta.</div>}
          {respostas.map((r) => {
            const form = forms.find((f) => f.id === r.formId);
            const turma = turmas.find((t) => t.id === r.turmaId);
            return (
              <div key={r.id} className="border rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    <strong>{form?.titulo || "Formulário"}</strong> • {turma?.nome || "Turma"}
                    <span className="ml-2 text-xs"><Tag>{new Date(r.data).toLocaleString()}</Tag></span>
                  </div>
                  <Button className="bg-white border text-xs" onClick={() => { const blob = new Blob([JSON.stringify(r, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `resposta_${r.id}.json`; a.click(); URL.revokeObjectURL(url); }}>Baixar JSON</Button>
                </div>
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-blue-600 font-medium">Ver respostas</summary>
                  <div className="mt-2 grid gap-2 pl-2 border-l-2 border-blue-100">
                    {Object.entries(r.payload).map(([qid, valor]) => {
                      const p = form?.perguntas.find((pp) => pp.id === qid);
                      return (
                        <div key={qid} className="text-sm">
                          <div className="font-medium text-gray-800">{p?.enunciado || qid}</div>
                          <div className="text-gray-600 whitespace-pre-wrap">{String(valor)}</div>
                        </div>
                      );
                    })}
                  </div>
                </details>
                <div className="mt-2 flex justify-end">
                  <Button className="bg-red-600 text-white text-xs" onClick={() => { if(window.confirm("Excluir?")) removeResposta(r.id); }}>Excluir</Button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* MODAL DE PREENCHIMENTO */}
      {fillOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-5 w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Preencher: {selectedForm?.titulo}</h3>
                <p className="text-sm text-gray-500">{selectedForm?.descricao}</p>
              </div>
              <button className="text-gray-500 hover:text-black" onClick={() => setFillOpen(false)}>✕ Fechar</button>
            </div>
            
            <div className="mb-4">
              <label className="text-sm font-medium">Selecione a Turma</label>
              <select
                className="w-full rounded-xl border px-3 py-2 bg-gray-50"
                value={fillTurmaId}
                onChange={(e) => setFillTurmaId(e.target.value)}
              >
                <option value="">Selecione...</option>
                {turmas.map((t) => <option key={t.id} value={t.id}>{t.nome} - {t.ano}</option>)}
              </select>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-6">
              {fillTurmaId && (selectedForm?.perguntas || []).map((p) => (
                <div key={p.id} className="border rounded-xl p-4 hover:border-gray-400 transition bg-white">
                  <div className="text-sm font-bold mb-2 text-gray-800">{p.enunciado}</div>
                  
                  {/* RESPOSTA CURTA */}
                  {p.tipo === "texto" && (
                    <Input value={fill[p.id] || ""} onChange={(e) => setFill({ ...fill, [p.id]: e.target.value })} />
                  )}
                  
                  {/* RESPOSTA LONGA / SELEÇÃO DE ALUNO */}
                  {p.tipo === "texto_longo" && (
                    isStudentCitingQuestion(p.enunciado) ? (
                      // WIDGET DE SELEÇÃO MÚLTIPLA DE ALUNO (NOVO)
                      <div className="bg-gray-50 p-3 rounded-xl border max-h-64 overflow-y-auto">
                          <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                              Selecione os alunos:
                          </div>
                          <div className="space-y-1">
                              {alunosDaTurma.length === 0 && <div className="text-xs text-gray-400">Nenhum aluno nesta turma.</div>}
                              {alunosDaTurma.map(aluno => {
                                  // fill[p.id] será um array de nomes: ['Aluno A', 'Aluno B']
                                  const isSelected = Array.isArray(fill[p.id]) && fill[p.id].includes(aluno.nome);
                                  
                                  const toggleAlunoSelection = (nomeAluno) => {
                                      const current = Array.isArray(fill[p.id]) ? fill[p.id] : [];
                                      const newSelection = current.includes(nomeAluno)
                                          ? current.filter(n => n !== nomeAluno)
                                          : [...current, nomeAluno];
                                      setFill({ ...fill, [p.id]: newSelection });
                                  };

                                  return (
                                      <div 
                                          key={aluno.id} 
                                          className={`flex items-center gap-2 p-1 rounded cursor-pointer transition ${isSelected ? 'bg-blue-100 border border-blue-400' : 'hover:bg-gray-200'}`}
                                          onClick={() => toggleAlunoSelection(aluno.nome)} // Clica na linha para selecionar/desmarcar
                                      >
                                          <button 
                                              onClick={(e) => { e.stopPropagation(); setZoomFoto(aluno.foto); }}
                                              className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden flex-shrink-0 border hover:border-blue-500 transition"
                                              title="Clique para ampliar foto"
                                          >
                                              {aluno.foto ? <img src={aluno.foto} className="w-full h-full object-cover"/> : <span className="text-xs">📷</span>}
                                          </button>
                                          <div className="text-sm flex-1 truncate">{aluno.nome}</div>
                                          <input type="checkbox" checked={isSelected} readOnly className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                                      </div>
                                  );
                              })}
                          </div>
                          <p className="mt-2 text-xs text-gray-500 italic">
                              {/* Esta visualização é útil para saber o que está selecionado */}
                              Total de selecionados: {Array.isArray(fill[p.id]) ? fill[p.id].length : 0}
                          </p>
                      </div>
                    ) : (
                      // TEXTAREA NORMAL
                      <Textarea
                          rows={3}
                          value={fill[p.id] || ""}
                          onChange={(e) => setFill({ ...fill, [p.id]: e.target.value })}
                          placeholder="Descreva detalhadamente..."
                      />
                    )
                  )}
                  
                  {/* MÚLTIPLA ESCOLHA (MULTI-SELEÇÃO AGORA) */}
                  {p.tipo === "multipla" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(p.opcoes || []).map((op) => {
                        // fill[p.id] é um array de strings
                        const isSelected = Array.isArray(fill[p.id]) && fill[p.id].includes(op);

                        const toggleSelection = (e) => {
                          const current = Array.isArray(fill[p.id]) ? fill[p.id] : [];
                          const newSelection = e.target.checked
                              ? [...current, op]
                              : current.filter(item => item !== op);
                          setFill({ ...fill, [p.id]: newSelection });
                        };

                        return (
                          <label key={op} className="flex items-center gap-3 text-sm p-2 rounded hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-200">
                            <input type="checkbox" name={p.id} checked={isSelected} onChange={toggleSelection} className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black" /> {op}
                          </label>
                        );
                      })}
                    </div>
                  )}
                  
                  {/* ESCALA */}
                  {p.tipo === "escala" && (
                    <div className="flex items-center gap-2 justify-between max-w-md">
                      <span className="text-xs text-gray-500">Mín ({p.min})</span>
                      <div className="flex gap-2">
                        {Array.from(
                            { length: (p.max ?? 5) - (p.min ?? 1) + 1 },
                            (_, i) => (p.min ?? 1) + i
                        ).map((v) => (
                            <label key={v} className={`flex flex-col items-center justify-center w-10 h-10 rounded-full border cursor-pointer transition ${
                                fill[p.id] === v ? "bg-black text-white border-black" : "bg-white text-gray-700 hover:bg-gray-100"
                            }`}>
                            <input type="radio" name={p.id} className="hidden" checked={fill[p.id] === v} onChange={() => setFill({ ...fill, [p.id]: v })} />
                            <span className="text-sm font-medium">{v}</span>
                            </label>
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">Máx ({p.max})</span>
                    </div>
                  )}
                </div>
              ))}
              {!fillTurmaId && <div className="text-center py-10 text-gray-400">Selecione uma turma acima para começar a preencher.</div>}
            </div>

            <div className="mt-4 pt-3 border-t flex justify-end gap-2">
              <Button className="bg-white border" onClick={() => window.print()}>Imprimir</Button>
              <Button className="bg-black text-white px-6" onClick={submitPreenchimento}>Enviar Resposta</Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE ZOOM DA FOTO */}
      {zoomFoto && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4" onClick={() => setZoomFoto(null)}>
          <img src={zoomFoto} alt="Zoom" className="max-w-full max-h-[90vh] rounded-lg shadow-2xl" />
          <button className="absolute top-4 right-4 text-white text-xl bg-black/50 w-10 h-10 rounded-full">✕</button>
        </div>
      )}
    </div>
  );
}