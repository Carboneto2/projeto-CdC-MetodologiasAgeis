import React, { useState, useEffect, useMemo, useContext } from "react";
import { AuthContext } from "../context/AuthContext"; 
import { useTurmas } from "../hooks/useTurmas";
import { useAlunos } from "../hooks/useAlunos";

export default function AreaRestritaView() {
    const { user } = useContext(AuthContext); 
    const { turmas } = useTurmas();
    const { alunos } = useAlunos();
    
    const [formularios, setFormularios] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedForm, setSelectedForm] = useState(null);
    const [perguntasFiltradas, setPerguntasFiltradas] = useState([]); 
    const [fillTurmaId, setFillTurmaId] = useState("");
    const [fill, setFill] = useState({});
    const [zoomFoto, setZoomFoto] = useState(null);

    useEffect(() => {
        fetch('http://localhost:5000/formularios')
            .then(res => res.json())
            .then(data => setFormularios(data))
            .catch(err => console.error(err));
    }, []);

    // --- FUNÇÃO QUE DETECTA SE A PERGUNTA É PARA SELECIONAR ALUNOS ---
    const isStudentSelector = (enunciado) => {
        if (!enunciado) return false;
        const texto = enunciado.toLowerCase();
        // Palavras-chave que transformam o campo de texto em lista de alunos
        return (
            texto.includes("discente") ||
            texto.includes("estudante") ||
            texto.includes("aluno") ||
            texto.includes("qual(is)") ||
            texto.includes("quais") ||
            texto.includes("relação de") ||
            texto.includes("quem")
        );
    };

    const handleResponder = (form) => {
        const permitidas = form.perguntas.filter(p => {
            if (!p.perfis) return true;
            return p.perfis.includes(user.perfil);
        });

        if (permitidas.length === 0) {
            return alert(`Sem perguntas para o perfil: ${user.perfil}`);
        }

        setSelectedForm(form);
        setPerguntasFiltradas(permitidas);
        setModalOpen(true);
    };

    const submitResposta = async () => {
        if (!fillTurmaId) return alert("Selecione a turma.");
        
        const payloadFinal = {};
        for (const [key, value] of Object.entries(fill)) {
            const q = perguntasFiltradas.find(p => p.id === key);
            if (!q) continue;
            payloadFinal[key] = Array.isArray(value) ? value.join(', ') : value;
        }

        const res = await fetch('http://localhost:5000/respostas', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                formulario_id: selectedForm.id,
                turma_id: fillTurmaId,
                payload: payloadFinal
            })
        });

        if (res.ok) {
            alert("Resposta enviada!");
            setModalOpen(false);
            setFill({});
            setFillTurmaId("");
        }
    };

    const alunosDaTurma = useMemo(() => alunos.filter(a => String(a.turmaId) === String(fillTurmaId)), [alunos, fillTurmaId]);

return (
  <div className="bg-gray-100 min-h-[calc(100vh-64px)]">
    <div className="max-w-7xl mx-auto p-6 space-y-6">

      {/* CABEÇALHO */}
      <header className="bg-white rounded-xl shadow-md border p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-red-700"></div>
        <h1 className="text-2xl font-bold text-green-800">
          Área de Colaboração
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Perfil de acesso: <span className="font-semibold">{user?.perfil}</span>
        </p>
      </header>

      {/* LISTA DE FORMULÁRIOS */}
      <section className="space-y-4">
        {formularios.map(form => (
          <div
            key={form.id}
            className="bg-white p-6 rounded-xl shadow-md border flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                {form.titulo}
              </h3>
              <p className="text-sm text-gray-600">
                {form.descricao}
              </p>
            </div>

            <button
              onClick={() => handleResponder(form)}
              className="bg-green-700 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-800 transition-all"
            >
              Responder
            </button>
          </div>
        ))}
      </section>

      {/* MODAL */}
      {modalOpen && selectedForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">

            {/* TOPO DO MODAL */}
            <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
              <h3 className="font-bold text-lg text-gray-800">
                {selectedForm.titulo}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-xl text-gray-500 hover:text-red-600"
              >
                ✕
              </button>
            </div>

            {/* SELEÇÃO DE TURMA */}
            <div className="p-4 bg-gray-50 border-b">
              <select
                className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700"
                value={fillTurmaId}
                onChange={e => setFillTurmaId(e.target.value)}
              >
                <option value="">Selecione a turma</option>
                {turmas.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.nome} - {t.ano}
                  </option>
                ))}
              </select>
            </div>

            {/* PERGUNTAS */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {fillTurmaId ? (
                perguntasFiltradas.map((p, i) => (
                  <div key={p.id} className="border-b pb-6">
                    <div className="font-bold mb-3 text-gray-800">
                      {i + 1}. {p.enunciado}
                    </div>

                    {p.tipo === "texto_longo" && isStudentSelector(p.enunciado) ? (
                      <div className="bg-gray-50 p-4 rounded-xl border">
                        <p className="text-xs text-gray-600 mb-3 font-bold uppercase">
                          Selecionar estudantes
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                          {alunosDaTurma.length === 0 && (
                            <p className="text-sm text-gray-500">
                              Nenhum aluno nesta turma.
                            </p>
                          )}

                          {alunosDaTurma.map(a => {
                            const sel = (fill[p.id] || []).includes(a.nome);
                            return (
                              <div
                                key={a.id}
                                onClick={() => {
                                  const cur = fill[p.id] || [];
                                  setFill({
                                    ...fill,
                                    [p.id]: sel
                                      ? cur.filter(x => x !== a.nome)
                                      : [...cur, a.nome]
                                  });
                                }}
                                className={`flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition
                                  ${
                                    sel
                                      ? "bg-green-50 border-green-600"
                                      : "bg-white hover:bg-gray-100"
                                  }`}
                              >
                                <div
                                  onClick={e => {
                                    e.stopPropagation();
                                    setZoomFoto(a.foto);
                                  }}
                                  className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden border"
                                >
                                  {a.foto ? (
                                    <img
                                      src={a.foto}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <span className="flex items-center justify-center h-full text-xs text-gray-500">
                                      Sem foto
                                    </span>
                                  )}
                                </div>

                                <span className="text-sm font-medium">
                                  {a.nome}
                                </span>

                                {sel && (
                                  <span className="ml-auto text-green-700 font-bold">
                                    ✔
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        <div className="mt-2 text-xs text-gray-600">
                          <strong>Selecionados:</strong>{" "}
                          {(fill[p.id] || []).join(", ") || "Nenhum"}
                        </div>
                      </div>
                    ) : p.tipo === "multipla" ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {p.opcoes.map(op => (
                          <label
                            key={op}
                            className="flex items-center gap-2 p-2 rounded cursor-pointer border hover:bg-gray-50"
                          >
                            <input
                              type="checkbox"
                              className="w-4 h-4 accent-green-700"
                              checked={(fill[p.id] || []).includes(op)}
                              onChange={e => {
                                const cur = fill[p.id] || [];
                                setFill({
                                  ...fill,
                                  [p.id]: e.target.checked
                                    ? [...cur, op]
                                    : cur.filter(x => x !== op)
                                });
                              }}
                            />
                            <span className="text-sm">{op}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <textarea
                        className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700"
                        rows={3}
                        placeholder="Digite sua resposta..."
                        value={fill[p.id] || ""}
                        onChange={e =>
                          setFill({ ...fill, [p.id]: e.target.value })
                        }
                      />
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-gray-400">
                  Selecione uma turma acima.
                </div>
              )}
            </div>

            {/* AÇÕES */}
            <div className="p-4 border-t flex justify-end gap-2 bg-gray-50 rounded-b-xl">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 border rounded-lg bg-white hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={submitResposta}
                className="px-6 py-2 bg-green-700 text-white rounded-lg font-bold hover:bg-green-800"
              >
                Enviar respostas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ZOOM FOTO */}
      {zoomFoto && (
        <div
          className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4"
          onClick={() => setZoomFoto(null)}
        >
          <img
            src={zoomFoto}
            className="max-h-[90vh] rounded-xl border-4 border-white"
          />
        </div>
      )}

    </div>
  </div>
);

}