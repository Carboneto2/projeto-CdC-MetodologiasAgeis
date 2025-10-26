import React, { useState, useMemo } from "react";
import { useForms } from "../hooks/useForms";
import { useTurmas } from "../hooks/useTurmas";
import { useAlunos } from "../hooks/useAlunos";
import { LS_KEYS, writeLS } from "../lib/storage";

import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";
import Textarea from "../components/Textarea";
import Tag from "../components/Tag";
import PerguntaEditor from "../components/PerguntaEditor"; // <-- IMPORTADO!

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

  // Preenchimento/Preview
  const [fillOpen, setFillOpen] = useState(false);
  const [fillFormId, setFillFormId] = useState("");
  const [fillTurmaId, setFillTurmaId] = useState("");
  const [fillAlunoId, setFillAlunoId] = useState("");
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
    if (!selectedForm || !fillTurmaId || !fillAlunoId)
      return alert("Selecione formulário, turma e aluno");
    addResposta(selectedForm.id, fillTurmaId, fillAlunoId, fill);
    setFillOpen(false);
    setFill({});
    alert("Resposta registrada!");
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
            <div className="flex flex-wrap gap-2">
              <Button className="bg-white border" onClick={() => addPergunta("texto")}>
                + Texto curto
              </Button>
              <Button className="bg-white border" onClick={() => addPergunta("texto_longo")}>
                + Texto longo
              </Button>
              <Button className="bg-white border" onClick={() => addPergunta("multipla")}>
                + Múltipla escolha
              </Button>
              <Button className="bg-white border" onClick={() => addPergunta("escala")}>
                + Escala (1-5)
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
                <div className="text-sm text-gray-500">
                  Nenhuma pergunta adicionada ainda.
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button className="bg-black text-white" onClick={salvarFormulario}>
                Salvar formulário
              </Button>
              <Button className="bg-white border" onClick={exportar}>
                Exportar backup
              </Button>
              <label className="bg-white border px-4 py-2 rounded-2xl shadow cursor-pointer">
                Importar JSON
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

          <div className="space-y-3">
            <h4 className="font-medium">Formulários salvos</h4>
            <div className="space-y-2">
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
                        {f.perguntas.length} pergunta(s)
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        className="bg-white border"
                        onClick={() => {
                          setTitulo(f.titulo);
                          setDescricao(f.descricao || "");
                          setPerguntas(f.perguntas);
                        }}
                      >
                        Editar
                      </Button>
                      <Button
                        className="bg-red-600 text-white"
                        onClick={() => removeForm(f.id)}
                      >
                        Excluir
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Button
                      className="bg-black text-white"
                      onClick={() => {
                        setFillFormId(f.id);
                        setFillOpen(true);
                      }}
                    >
                      Preencher
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
          {respostas.length === 0 && (
            <div className="text-sm text-gray-500">
              Ainda não há respostas.
            </div>
          )}
          {respostas.map((r) => {
            const form = forms.find((f) => f.id === r.formId);
            const turma = turmas.find((t) => t.id === r.turmaId);
            const aluno = alunos.find((a) => a.id === r.alunoId);
            return (
              <div key={r.id} className="border rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    <strong>{form?.titulo || "Formulário"}</strong> •{" "}
                    {turma?.nome || "Turma"} • {aluno?.nome || "Aluno"}
                    <span className="ml-2 text-xs">
                      <Tag>{new Date(r.data).toLocaleString()}</Tag>
                    </span>
                  </div>
                  <Button
                    className="bg-white border"
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
                  <summary className="cursor-pointer text-sm">
                    Ver respostas
                  </summary>
                  <div className="mt-2 grid gap-2">
                    {Object.entries(r.payload).map(([qid, valor]) => {
                      const p = form?.perguntas.find((pp) => pp.id === qid);
                      return (
                        <div key={qid} className="text-sm">
                          <div className="font-medium">{p?.enunciado || qid}</div>
                          <div className="text-gray-700">{String(valor)}</div>
                        </div>
                      );
                    })}
                  </div>
                </details>
                <div className="mt-2">
                  <Button
                    className="bg-red-600 text-white"
                    onClick={() => removeResposta(r.id)}
                  >
                    Excluir
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* MODAL DE PREENCHIMENTO */}
      {fillOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-5 w-full max-w-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  Preencher: {selectedForm?.titulo}
                </h3>
                <p className="text-sm text-gray-500">
                  {selectedForm?.descricao}
                </p>
              </div>
              <button className="text-sm" onClick={() => setFillOpen(false)}>
                Fechar
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="text-sm">Turma</label>
                <select
                  className="w-full rounded-xl border px-3 py-2"
                  value={fillTurmaId}
                  onChange={(e) => {
                    setFillTurmaId(e.target.value);
                    setFillAlunoId("");
                  }}
                >
                  <option value="">Selecione</option>
                  {turmas.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm">Aluno</label>
                <select
                  className="w-full rounded-xl border px-3 py-2"
                  value={fillAlunoId}
                  onChange={(e) => setFillAlunoId(e.target.value)}
                >
                  <option value="">Selecione</option>
                  {alunosDaTurma.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4 space-y-4 max-h-[50vh] overflow-auto pr-1">
              {(selectedForm?.perguntas || []).map((p) => (
                <div key={p.id} className="border rounded-xl p-3">
                  <div className="text-sm font-medium mb-2">
                    {p.enunciado || (
                      <em className="text-gray-400">(sem enunciado)</em>
                    )}
                  </div>
                  {p.tipo === "texto" && (
                    <Input
                      value={fill[p.id] || ""}
                      onChange={(e) =>
                        setFill({ ...fill, [p.id]: e.target.value })
                      }
                    />
                  )}
                  {p.tipo === "texto_longo" && (
                    <Textarea
                      rows={4}
                      value={fill[p.id] || ""}
                      onChange={(e) =>
                        setFill({ ...fill, [p.id]: e.target.value })
                      }
                    />
                  )}
                  {p.tipo === "multipla" && (
                    <div className="grid grid-cols-2 gap-2">
                      {(p.opcoes || []).map((op) => (
                        <label key={op} className="flex items-center gap-2 text-sm">
                          <input
                            type="radio"
                            name={p.id}
                            checked={fill[p.id] === op}
                            onChange={() => setFill({ ...fill, [p.id]: op })}
                          />{" "}
                          {op}
                        </label>
                      ))}
                    </div>
                  )}
                  {p.tipo === "escala" && (
                    <div className="flex items-center gap-2 flex-wrap">
                      {Array.from(
                        { length: (p.max ?? 5) - (p.min ?? 1) + 1 },
                        (_, i) => (p.min ?? 1) + i
                      ).map((v) => (
                        <label key={v} className="flex items-center gap-1 text-sm">
                          <input
                            type="radio"
                            name={p.id}
                            checked={fill[p.id] === v}
                            onChange={() => setFill({ ...fill, [p.id]: v })}
                          />{" "}
                          {v}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                className="bg-white border"
                onClick={() => {
                  window.print();
                }}
              >
                Imprimir
              </Button>
              <Button
                className="bg-black text-white"
                onClick={submitPreenchimento}
              >
                Enviar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}