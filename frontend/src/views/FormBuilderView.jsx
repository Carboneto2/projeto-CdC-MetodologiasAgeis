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

export default function FormBuilderView({ user }) {
  // PERFIL
  const isCoordenador = user?.perfil === "Coordenador";
  const isProfessor = user?.perfil === "Professor";

  const { forms, addForm, removeForm, respostas, removeResposta, addResposta } =
    useForms();
  const { turmas } = useTurmas();
  const { alunos } = useAlunos();

  // ESTADOS DO FORMULÁRIO (CRIAÇÃO)
  const [titulo, setTitulo] = useState(
    "Conselho de Classe — Formulário padrão",
  );
  const [descricao, setDescricao] = useState(
    "Use este formulário para registrar percepções, notas e encaminhamentos.",
  );
  const [perguntas, setPerguntas] = useState([]);

  const [editFormId, setEditFormId] = useState(null);

  // ZOOM DE FOTO
  const [zoomFoto, setZoomFoto] = useState(null);

  // IDENTIFICA PERGUNTAS QUE CITAM ALUNOS
  const isStudentCitingQuestion = (enunciado) => {
    return (
      enunciado.includes("(Cite os nomes):") ||
      enunciado.includes("Quais estudantes foram atendidos") ||
      enunciado.includes("Quais estudantes NÃO atingiram")
    );
  };

  // =========================
  // MODELO OFICIAL
  // =========================
  const gerarModeloPadrao = () => {
    if (
      perguntas.length > 0 &&
      !window.confirm("Isso substituirá suas perguntas atuais. Continuar?")
    ) {
      return;
    }

    setTitulo("Conselho de Classe — Modelo Oficial");
    setDescricao(
      "Análise completa da turma: Docente, NAE, NAPNE, NEABI e NEPGES.",
    );

    setPerguntas([
      {
        id: generateId(),
        tipo: "texto_longo",
        enunciado:
          "Fragilidades e positividades existentes na turma e proposições/soluções (Visão Coordenador):",
      },
      { id: generateId(), tipo: "texto", enunciado: "Disciplina:" },
      {
        id: generateId(),
        tipo: "multipla",
        enunciado: "Em sua opinião, quais são as POTENCIALIDADES da turma?",
        opcoes: [
          "Engajamento dos Alunos",
          "Colaboração",
          "Participação em Discussões",
          "Respeito Mútuo",
          "Alunos Motivados",
          "Foco na Melhoria",
          "Resiliência",
          "Participação em Atividades Extracurriculares",
          "Comunicação Eficaz",
          "Iniciativa",
          "Habilidade de Resolução de Conflitos",
          "Aceitação da Diversidade",
          "Frequência às Aulas",
          "Aproveitamento do Tempo de Estudo",
          "Atenção às Normas e Regulamentos",
          "Habilidades de Autodireção",
          "Participação dos Pais/Responsáveis",
          "Outro (descrever nas observações)",
        ],
      },
      {
        id: generateId(),
        tipo: "multipla",
        enunciado: "Em sua opinião, quais são as FRAGILIDADES da turma?",
        opcoes: [
          "Baixo Envolvimento dos Alunos",
          "Dificuldade na Colaboração",
          "Participação Limitada em Discussões",
          "Falta de Respeito Mútuo",
          "Falta de Motivação",
          "Dificuldade em Aceitar Feedback",
          "Fragilidade Diante de Desafios",
          "Baixa Participação em Atividades Extracurriculares",
          "Comunicação Ineficaz",
          "Frequência Irregular às Aulas",
          "Procrastinação",
          "Desrespeito às Normas e Regulamentos",
          "Necessidade de Apoio",
          "Falta de Autodireção",
          "Pouco Envolvimento dos Pais/Responsáveis",
          "Conversas paralelas",
          "Outro (descrever nas observações)",
        ],
      },
      {
        id: generateId(),
        tipo: "texto_longo",
        enunciado: "Relação de Estudantes DESTAQUES (Cite os nomes):",
      },
      {
        id: generateId(),
        tipo: "texto_longo",
        enunciado: "Relação de Estudantes INFREQUENTES (Cite os nomes):",
      },
      {
        id: generateId(),
        tipo: "texto_longo",
        enunciado:
          "Discentes com MAIORES DIFICULDADES de aprendizagem (Cite os nomes):",
      },
      {
        id: generateId(),
        tipo: "texto_longo",
        enunciado: "Detalhe as dificuldades (se achar conveniente):",
      },
      {
        id: generateId(),
        tipo: "texto_longo",
        enunciado:
          "Quais estudantes NÃO atingiram a média no trimestre? (Cite os nomes):",
      },
      {
        id: generateId(),
        tipo: "texto_longo",
        enunciado:
          "Sugestão para encaminhamento ao APOIO PSICOLÓGICO (Cite os nomes):",
      },
      {
        id: generateId(),
        tipo: "texto_longo",
        enunciado:
          "NAE: Quais estudantes foram atendidos pelos serviços de apoio psicológico?",
      },
      {
        id: generateId(),
        tipo: "texto_longo",
        enunciado: "NAE: Qual o tipo de atendimento ofertado?",
      },
      {
        id: generateId(),
        tipo: "texto_longo",
        enunciado:
          "NAE: Discentes atendidos pelo SERVIÇO SOCIAL (Cite os nomes):",
      },
      {
        id: generateId(),
        tipo: "texto_longo",
        enunciado:
          "NAE: Qual o tipo de atendimento necessário (Serviço Social)?",
      },
      {
        id: generateId(),
        tipo: "texto_longo",
        enunciado: "Considerações do ASSISTENTE DE ALUNO:",
      },
      {
        id: generateId(),
        tipo: "texto_longo",
        enunciado:
          "NAPNE: Relação de discentes com necessidades específicas (descrever tipo de atendimento):",
      },
      {
        id: generateId(),
        tipo: "multipla",
        enunciado:
          "NEABI: Houve ações para promover a discussão das relações étnico-raciais com a turma?",
        opcoes: ["Sim", "Não"],
      },
      {
        id: generateId(),
        tipo: "texto_longo",
        enunciado: "NEABI: Se sim, relate as ações:",
      },
      {
        id: generateId(),
        tipo: "multipla",
        enunciado:
          "NEPGES: Houve ações para promover a discussão sobre gênero e sexualidade com a turma?",
        opcoes: ["Sim", "Não"],
      },
      {
        id: generateId(),
        tipo: "texto_longo",
        enunciado: "NEPGES: Se sim, relate as ações:",
      },
    ]);

    alert("Modelo Oficial carregado com sucesso!");
  };

  const addPergunta = (tipo) => {
    setPerguntas((prev) => [
      ...prev,
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
  // =========================
  // SALVAR FORMULÁRIO
  // =========================
  const salvarFormulario = () => {
    // Coordenador é o ÚNICO que salva / cria formulário
    if (!isCoordenador) {
      alert("Apenas o coordenador pode criar ou editar formulários.");
      return;
    }

    if (!titulo.trim() || perguntas.length === 0) {
      alert("Defina título e ao menos 1 pergunta.");
      return;
    }

    if (editFormId) {
      removeForm(editFormId);
      setEditFormId(null);
    }

    addForm({
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      perguntas,
    });

    // Reset
    setTitulo("Conselho de Classe — Formulário padrão");
    setDescricao("");
    setPerguntas([]);

    alert("Formulário salvo com sucesso!");
  };

  // =========================
  // EXCLUIR FORMULÁRIO
  // =========================
  const handleExcluirForm = (id) => {
    if (!isCoordenador) {
      alert("Apenas o coordenador pode excluir formulários.");
      return;
    }

    if (window.confirm("Deseja realmente excluir este formulário?")) {
      removeForm(id);
    }
  };

  // =========================
  // EXPORTAR / IMPORTAR
  // =========================
  const exportar = () => {
    if (!isCoordenador) {
      alert("Apenas o coordenador pode exportar dados.");
      return;
    }

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

  const importar = (file) => {
    if (!isCoordenador) {
      alert("Apenas o coordenador pode importar dados.");
      return;
    }

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
          alert("Arquivo inválido.");
        }
      } catch {
        alert("Erro ao importar o arquivo.");
      }
    };

    reader.readAsText(file);
  };

  // =========================
  // PREENCHIMENTO (PROFESSOR + COORDENADOR)
  // =========================
  const [fillOpen, setFillOpen] = useState(false);
  const [fillFormId, setFillFormId] = useState("");
  const [fillTurmaId, setFillTurmaId] = useState("");
  const [fill, setFill] = useState({});

  const selectedForm = useMemo(
    () => forms.find((f) => f.id === fillFormId),
    [forms, fillFormId],
  );

  const alunosDaTurma = useMemo(
    () => alunos.filter((a) => a.turmaId === fillTurmaId),
    [alunos, fillTurmaId],
  );

  const jaRespondeu = (formId, turmaId) => {
    return respostas.some(
      (r) =>
        r.formId === formId && r.turmaId === turmaId && r.userId === user.id,
    );
  };

  const submitPreenchimento = () => {
    // Professor E Coordenador podem preencher
    if (!selectedForm || !fillTurmaId) {
      alert("Selecione o formulário e a turma.");
      return;
    }

    if (Object.keys(fill).length === 0) {
      alert("Preencha ao menos uma resposta.");
      return;
    }

    const payload = {};

    for (const [key, value] of Object.entries(fill)) {
      const question = selectedForm.perguntas.find((p) => p.id === key);
      if (!question) continue;

      if (isStudentCitingQuestion(question.enunciado) && Array.isArray(value)) {
        payload[key] = value.map((name) => `- ${name}`).join("\n");
      } else if (question.tipo === "multipla" && Array.isArray(value)) {
        payload[key] = value.join(", ");
      } else {
        payload[key] = value;
      }
    }
    for (const pergunta of selectedForm.perguntas) {
      const resposta = fill[pergunta.id];

      // Texto curto / longo
      if (
        (pergunta.tipo === "texto" || pergunta.tipo === "texto_longo") &&
        (!resposta || String(resposta).trim() === "")
      ) {
        alert(`Responda a pergunta:\n"${pergunta.enunciado}"`);
        return;
      }

      // Múltipla escolha
      if (
        pergunta.tipo === "multipla" &&
        (!Array.isArray(resposta) || resposta.length === 0)
      ) {
        alert(`Selecione ao menos uma opção em:\n"${pergunta.enunciado}"`);
        return;
      }

      // Escala
      if (pergunta.tipo === "escala" && resposta === undefined) {
        alert(`Selecione um valor em:\n"${pergunta.enunciado}"`);
        return;
      }
    }

    addResposta(
      selectedForm.id,
      fillTurmaId,
      user.id, // ou user.email ou user.matricula (algo único)
      payload,
    );

    setFillOpen(false);
    setFill({});
    setFillTurmaId("");

    alert("Resposta registrada com sucesso!");
  };
  // =========================
  // RENDER
  // =========================
  return (
    <div className="space-y-4">
      {/* =========================
          ÁREA DO COORDENADOR
         ========================= */}
      {isCoordenador && (
        <Card
          title="Novo formulário"
          subtitle="Criação e edição dos formulários do Conselho de Classe."
        >
          <div className="grid md:grid-cols-2 gap-4">
            {/* COLUNA ESQUERDA */}
            <div className="space-y-3">
              <div>
                <label className="text-sm">Título</label>
                <Input
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm">Descrição</label>
                <Textarea
                  rows={2}
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs font-semibold text-gray-500 uppercase mr-2">
                  Adicionar:
                </span>
                <Button
                  className="bg-white border text-xs"
                  onClick={() => addPergunta("texto")}
                >
                  + Curto
                </Button>
                <Button
                  className="bg-white border text-xs"
                  onClick={() => addPergunta("texto_longo")}
                >
                  + Longo
                </Button>
                <Button
                  className="bg-white border text-xs"
                  onClick={() => addPergunta("multipla")}
                >
                  + Múltipla
                </Button>
                <Button
                  className="bg-white border text-xs"
                  onClick={() => addPergunta("escala")}
                >
                  + Escala
                </Button>
              </div>

              <div className="space-y-3 border-t pt-3">
                {perguntas.map((p) => (
                  <PerguntaEditor
                    key={p.id}
                    p={p}
                    onChange={(novo) =>
                      setPerguntas((prev) =>
                        prev.map((x) => (x.id === p.id ? novo : x)),
                      )
                    }
                    onRemove={() =>
                      setPerguntas((prev) => prev.filter((x) => x.id !== p.id))
                    }
                  />
                ))}

                {perguntas.length === 0 && (
                  <div className="text-sm text-gray-500 italic py-4 text-center border-2 border-dashed rounded-xl">
                    Nenhuma pergunta.
                    <br />
                    Use o modelo oficial abaixo.
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 border-t pt-3">
                <Button
                  className="bg-black text-white"
                  onClick={salvarFormulario}
                >
                  Salvar
                </Button>
                <Button
                  className="bg-blue-600 text-white"
                  onClick={gerarModeloPadrao}
                >
                  Carregar Modelo Oficial
                </Button>

                <div className="flex gap-2 ml-auto">
                  <Button className="bg-white border" onClick={exportar}>
                    Backup
                  </Button>
                  <label className="bg-white border px-4 py-2 rounded-2xl shadow cursor-pointer text-sm flex items-center hover:bg-gray-50">
                    Importar
                    <input
                      type="file"
                      accept="application/json"
                      className="hidden"
                      onChange={(e) =>
                        e.target.files?.[0] && importar(e.target.files[0])
                      }
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* COLUNA DIREITA */}
            <div className="space-y-3">
              <h4 className="font-medium">Formulários salvos</h4>
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {forms.map((f) => (
                  <div key={f.id} className="border rounded-xl p-3 bg-gray-50">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium">{f.titulo}</div>
                        <div className="text-xs text-gray-500">
                          {f.perguntas.length} pergunta(s)
                        </div>
                      </div>

                      <div className="flex gap-1">
                        <Button
                          className="bg-white border text-xs px-2"
                          onClick={() => {
                            setEditFormId(f.id);
                            setTitulo(f.titulo);
                            setDescricao(f.descricao || "");
                            setPerguntas(f.perguntas);
                          }}
                        >
                          Editar
                        </Button>
                        <Button
                          className="bg-red-100 text-red-700 border border-red-200 text-xs px-2"
                          onClick={() => handleExcluirForm(f.id)}
                        >
                          Excluir
                        </Button>
                      </div>
                    </div>

                    <div className="mt-2">
                      <Button
                        className="bg-black text-white w-full text-sm"
                        onClick={() => {
                          if (jaRespondeu(f.id, fillTurmaId)) {
                            alert(
                              "Você já respondeu este conselho para esta turma.",
                            );
                            return;
                          }
                          setFillFormId(f.id);
                          setFill({});
                          setFillTurmaId("");
                          setFillOpen(true);
                        }}
                      >
                        Preencher este formulário
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ÁREA DO PROFESSOR */}
      {isProfessor && (
        <Card
          title="Conselho de Classe"
          subtitle="Selecione um formulário para preencher."
        >
          <div className="space-y-2">
            {forms.map((f) => (
              <div key={f.id} className="border rounded-xl p-3 bg-gray-50">
                <div className="font-medium">{f.titulo}</div>

                <Button
                  className="bg-black text-white w-full text-sm"
                  onClick={() => {
                    setFillFormId(f.id);
                    setFillOpen(true);
                  }}
                >
                  Preencher Conselho de Classe
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
      {/* =========================
          RESPOSTAS REGISTRADAS
         ========================= */}
      <Card
        title="Respostas registradas"
        subtitle={`${respostas.length} resposta(s)`}
      >
        <div className="space-y-3">
          {respostas.length === 0 && (
            <div className="text-sm text-gray-500">Nenhuma resposta.</div>
          )}

          {respostas.map((r) => {
            const form = forms.find((f) => f.id === r.formId);
            const turma = turmas.find((t) => t.id === r.turmaId);

            return (
              <div key={r.id} className="border rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    <strong>{form?.titulo || "Formulário"}</strong> •{" "}
                    {turma?.nome || "Turma"}
                    <span className="ml-2 text-xs">
                      <Tag>{new Date(r.data).toLocaleString()}</Tag>
                    </span>
                  </div>

                  <Button
                    className="bg-white border text-xs"
                    onClick={() => {
                      const blob = new Blob([JSON.stringify(r, null, 2)], {
                        type: "application/json",
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `resposta_${r.id}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                  >
                    Baixar JSON
                  </Button>
                </div>

                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-blue-600 font-medium">
                    Ver respostas
                  </summary>

                  <div className="mt-2 grid gap-2 pl-2 border-l-2 border-blue-100">
                    {Object.entries(r.payload).map(([qid, valor]) => {
                      const p = form?.perguntas.find((pp) => pp.id === qid);
                      return (
                        <div key={qid} className="text-sm">
                          <div className="font-medium text-gray-800">
                            {p?.enunciado || qid}
                          </div>
                          <div className="text-gray-600 whitespace-pre-wrap">
                            {String(valor)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </details>

                {/* EXCLUIR → SOMENTE COORDENADOR */}
                {isCoordenador && (
                  <div className="mt-2 flex justify-end">
                    <Button
                      className="bg-red-600 text-white text-xs"
                      onClick={() => {
                        if (window.confirm("Excluir esta resposta?")) {
                          removeResposta(r.id);
                        }
                      }}
                    >
                      Excluir
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
      {/* MODAL DE PREENCHIMENTO */}
      {fillOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-5 w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* CABEÇALHO */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">
                  Preencher: {selectedForm?.titulo}
                </h3>
                <p className="text-sm text-gray-500">
                  {selectedForm?.descricao}
                </p>
              </div>
              <button onClick={() => setFillOpen(false)}>✕</button>
            </div>

            {/* SELEÇÃO DE TURMA */}
            <div className="mb-4">
              <label className="text-sm font-medium">Selecione a Turma</label>
              <select
                className="w-full border rounded-xl px-3 py-2"
                value={fillTurmaId}
                onChange={(e) => setFillTurmaId(e.target.value)}
              >
                <option value="">Selecione...</option>
                {turmas.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* PERGUNTAS */}
            <div className="flex-1 overflow-y-auto space-y-4">
              {fillTurmaId &&
                selectedForm?.perguntas.map((p) => (
                  <div key={p.id} className="border rounded-xl p-4">
                    <div className="font-medium mb-2">{p.enunciado}</div>

                    {/* TEXTO */}
                    {p.tipo === "texto" && (
                      <Input
                        value={fill[p.id] || ""}
                        onChange={(e) =>
                          setFill({ ...fill, [p.id]: e.target.value })
                        }
                      />
                    )}

                    {/* TEXTO LONGO */}
                    {p.tipo === "texto_longo" &&
                      !isStudentCitingQuestion(p.enunciado) && (
                        <Textarea
                          rows={3}
                          value={fill[p.id] || ""}
                          onChange={(e) =>
                            setFill({ ...fill, [p.id]: e.target.value })
                          }
                        />
                      )}

                    {p.tipo === "multipla" && (
                      <div className="space-y-2">
                        {(p.opcoes || []).map((op) => {
                          const marcado =
                            Array.isArray(fill[p.id]) &&
                            fill[p.id].includes(op);

                          return (
                            <label
                              key={op}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={marcado}
                                onChange={() => {
                                  const atual = Array.isArray(fill[p.id])
                                    ? fill[p.id]
                                    : [];
                                  setFill({
                                    ...fill,
                                    [p.id]: marcado
                                      ? atual.filter((v) => v !== op)
                                      : [...atual, op],
                                  });
                                }}
                              />
                              {op}
                            </label>
                          );
                        })}
                      </div>
                    )}

                    {p.tipo === "escala" && (
                      <div className="flex gap-2">
                        {Array.from(
                          { length: (p.max ?? 5) - (p.min ?? 1) + 1 },
                          (_, i) => (p.min ?? 1) + i,
                        ).map((v) => (
                          <button
                            key={v}
                            className={`w-8 h-8 rounded-full border ${
                              fill[p.id] === v
                                ? "bg-black text-white"
                                : "bg-white"
                            }`}
                            onClick={() => setFill({ ...fill, [p.id]: v })}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* TEXTO LONGO COM ALUNOS */}
                    {p.tipo === "texto_longo" &&
                      isStudentCitingQuestion(p.enunciado) && (
                        <div className="space-y-1">
                          {alunosDaTurma.map((aluno) => {
                            const selecionado =
                              Array.isArray(fill[p.id]) &&
                              fill[p.id].includes(aluno.nome);

                            return (
                              <div
                                key={aluno.id}
                                className={`flex items-center gap-2 p-2 rounded cursor-pointer ${
                                  selecionado
                                    ? "bg-blue-100"
                                    : "hover:bg-gray-100"
                                }`}
                                onClick={() => {
                                  const atual = Array.isArray(fill[p.id])
                                    ? fill[p.id]
                                    : [];
                                  setFill({
                                    ...fill,
                                    [p.id]: selecionado
                                      ? atual.filter((n) => n !== aluno.nome)
                                      : [...atual, aluno.nome],
                                  });
                                }}
                              >
                                <img
                                  src={aluno.foto}
                                  className="w-8 h-8 rounded-full object-cover"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setZoomFoto(aluno.foto);
                                  }}
                                />
                                <span>{aluno.nome}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                  </div>
                ))}
            </div>

            {/* AÇÕES */}
            <div className="mt-4 flex justify-end">
              <Button
                className="bg-black text-white"
                onClick={submitPreenchimento}
              >
                Enviar Resposta
              </Button>
            </div>
          </div>
        </div>
      )}

      {zoomFoto && (
        <div
          className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center"
          onClick={() => setZoomFoto(null)}
        >
          <img src={zoomFoto} className="max-w-full max-h-[90vh] rounded-lg" />
        </div>
      )}
    </div>
  );
}
