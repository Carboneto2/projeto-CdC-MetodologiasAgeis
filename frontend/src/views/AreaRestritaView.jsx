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
    const [fillTurmaId, setFillTurmaId] = useState("");
    const [fill, setFill] = useState({});
    const [zoomFoto, setZoomFoto] = useState(null);

    // Carrega todos os formulários
    useEffect(() => {
        fetch('http://localhost:5000/formularios')
            .then(res => res.json())
            .then(data => {
                console.log("Formulários carregados:", data);
                setFormularios(data);
            })
            .catch(err => console.error(err));
    }, []);

    // Filtra formulários que o usuário pode ver baseado no campo "perfis" do formulário
    const formulariosVisiveis = useMemo(() => {
        if (!user?.perfil) return [];
        
        return formularios.filter(form => {
            // IMPORTANTE: Se o formulário não tem a propriedade "perfis", 
            // significa que foi criado antes da atualização. Nesse caso, mostra para todos.
            if (!form.perfis || form.perfis.length === 0) {
                console.log(`Formulário "${form.titulo}" sem restrição de perfis - visível para todos`);
                return true;
            }
            
            // Verifica se o perfil do usuário está na lista de perfis do formulário
            const podeVer = form.perfis.includes(user.perfil);
            console.log(`Formulário "${form.titulo}" (perfis: ${form.perfis.join(', ')}) visível para ${user.perfil}? ${podeVer}`);
            return podeVer;
        });
    }, [formularios, user]);

    // Filtra perguntas dentro do formulário que o usuário pode responder
    const getPerguntasPermitidas = (form) => {
        if (!form?.perguntas || !user?.perfil) return [];
        
        return form.perguntas.filter(pergunta => {
            // Se a pergunta não tem restrição de perfil, permite para todos
            if (!pergunta.perfis || pergunta.perfis.length === 0) {
                return true;
            }
            
            // Verifica se o perfil do usuário está na lista de perfis da pergunta
            const podeResponder = pergunta.perfis.includes(user.perfil);
            return podeResponder;
        });
    };

    // Mantida para compatibilidade com formulários antigos
    const isStudentSelector = (enunciado) => {
        if (!enunciado) return false;
        const texto = enunciado.toLowerCase();
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
        const perguntasPermitidas = getPerguntasPermitidas(form);
        
        if (perguntasPermitidas.length === 0) {
            return alert(`Você não tem permissão para responder este formulário.`);
        }
        
        setSelectedForm({
            ...form,
            perguntasFiltradas: perguntasPermitidas
        });
        setModalOpen(true);
        setFill({});
        setFillTurmaId("");
    };

    const submitResposta = async () => {
        if (!fillTurmaId) return alert("Selecione a turma.");
        if (!selectedForm) return;
        
        const payloadFinal = {};
        const perguntasFiltradas = selectedForm.perguntasFiltradas || [];
        
        for (const [key, value] of Object.entries(fill)) {
            const q = perguntasFiltradas.find(p => p.id === key);
            if (!q) continue;
            
            // Para lista de alunos, converter array de IDs para string de nomes separados por vírgula
            if (q.tipo === "lista_alunos") {
                if (Array.isArray(value) && value.length > 0) {
                    // Converter IDs para nomes
                    const nomes = value.map(id => {
                        const aluno = alunosDaTurma.find(a => a.id === id);
                        return aluno ? aluno.nome : '';
                    }).filter(nome => nome !== '');
                    payloadFinal[key] = nomes.join(', ');
                } else {
                    payloadFinal[key] = '';
                }
            } else {
                // Para outros tipos, manter formato original
                payloadFinal[key] = Array.isArray(value) ? value.join(', ') : value;
            }
        }

        try {
            const res = await fetch('http://localhost:5000/respostas', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    formulario_id: selectedForm.id,
                    turma_id: fillTurmaId,
                    payload: payloadFinal,
                    perfil_usuario: user.perfil
                })
            });

            if (res.ok) {
                alert("Resposta enviada com sucesso!");
                setModalOpen(false);
                setFill({});
                setFillTurmaId("");
                setSelectedForm(null);
            } else {
                alert("Erro ao enviar resposta.");
            }
        } catch (err) {
            console.error(err);
            alert("Erro de conexão.");
        }
    };

    const alunosDaTurma = useMemo(() => 
        alunos.filter(a => String(a.turmaId) === String(fillTurmaId)), 
        [alunos, fillTurmaId]
    );

    // Renderiza o campo de resposta baseado no tipo da pergunta
    const renderCampoResposta = (pergunta) => {
        // Para formulários antigos sem tipo definido, usar detecção por texto
        if (!pergunta.tipo) {
            if (isStudentSelector(pergunta.enunciado)) {
                return renderListaAlunos(pergunta);
            } else {
                return (
                    <textarea
                        className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700"
                        rows={3}
                        placeholder="Digite sua resposta..."
                        value={fill[pergunta.id] || ""}
                        onChange={e => setFill({ ...fill, [pergunta.id]: e.target.value })}
                    />
                );
            }
        }

        switch (pergunta.tipo) {
            case "lista_alunos":
                return renderListaAlunos(pergunta);

            case "multipla":
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {pergunta.opcoes?.map(op => (
                            <label key={op} className="flex items-center gap-2 p-2 rounded cursor-pointer border hover:bg-gray-50">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 accent-green-700"
                                    checked={(fill[pergunta.id] || []).includes(op)}
                                    onChange={e => {
                                        const atual = fill[pergunta.id] || [];
                                        setFill({
                                            ...fill,
                                            [pergunta.id]: e.target.checked
                                                ? [...atual, op]
                                                : atual.filter(x => x !== op)
                                        });
                                    }}
                                />
                                <span className="text-sm">{op}</span>
                            </label>
                        ))}
                    </div>
                );

            case "texto":
                return (
                    <input
                        type="text"
                        className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700"
                        placeholder="Digite sua resposta..."
                        value={fill[pergunta.id] || ""}
                        onChange={e => setFill({ ...fill, [pergunta.id]: e.target.value })}
                    />
                );

            case "texto_longo":
            default:
                // Se for texto longo mas o enunciado sugerir lista de alunos, renderizar como lista
                if (isStudentSelector(pergunta.enunciado)) {
                    return renderListaAlunos(pergunta);
                }
                return (
                    <textarea
                        className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700"
                        rows={3}
                        placeholder="Digite sua resposta..."
                        value={fill[pergunta.id] || ""}
                        onChange={e => setFill({ ...fill, [pergunta.id]: e.target.value })}
                    />
                );
        }
    };

    const renderListaAlunos = (pergunta) => {
        return (
            <div className="bg-gray-50 p-4 rounded-xl border">
                <p className="text-xs text-gray-600 mb-3 font-bold uppercase">
                    Selecione os estudantes:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                    {alunosDaTurma.length === 0 ? (
                        <div className="col-span-2 text-center py-4 text-gray-500">
                            Nenhum aluno cadastrado nesta turma.
                        </div>
                    ) : (
                        alunosDaTurma.map(a => {
                            const selecionado = (fill[pergunta.id] || []).includes(a.id);
                            return (
                                <div
                                    key={a.id}
                                    onClick={() => {
                                        const atual = fill[pergunta.id] || [];
                                        setFill({
                                            ...fill,
                                            [pergunta.id]: selecionado
                                                ? atual.filter(x => x !== a.id)
                                                : [...atual, a.id]
                                        });
                                    }}
                                    className={`flex items-center gap-3 p-2 rounded-lg border cursor-pointer ${selecionado ? 'bg-green-50 border-green-600' : 'bg-white hover:bg-gray-100'}`}
                                >
                                    <div
                                        onClick={e => {
                                            e.stopPropagation();
                                            setZoomFoto(a.foto);
                                        }}
                                        className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden border flex-shrink-0"
                                    >
                                        {a.foto ? (
                                            <img 
                                                src={a.foto} 
                                                alt={a.nome}
                                                className="w-full h-full object-cover" 
                                            />
                                        ) : (
                                            <span className="flex items-center justify-center h-full text-xs text-gray-500">
                                                Sem foto
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-sm font-medium block">{a.nome}</span>
                                        <span className="text-xs text-gray-500">Matrícula: {a.matricula || 'N/A'}</span>
                                    </div>
                                    {selecionado && <span className="ml-auto text-green-700 font-bold">✔</span>}
                                </div>
                            );
                        })
                    )}
                </div>
                <div className="mt-2 text-xs text-gray-600">
                    <strong>Selecionados:</strong> {
                        (fill[pergunta.id] || [])
                            .map(id => alunosDaTurma.find(a => a.id === id)?.nome)
                            .filter(nome => nome)
                            .join(", ") || "Nenhum"
                    }
                </div>
            </div>
        );
    };

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
                        Perfil: <span className="font-semibold capitalize">{user?.perfil}</span>
                        <span className="ml-4">
                            {formulariosVisiveis.length} de {formularios.length} formulários disponíveis
                        </span>
                    </p>
                </header>

                {/* LISTA DE FORMULÁRIOS */}
                <section className="space-y-4">
                    {formulariosVisiveis.length === 0 ? (
                        <div className="bg-white p-8 rounded-xl shadow-md border text-center">
                            <p className="text-gray-600">
                                Nenhum formulário disponível para o seu perfil ({user?.perfil}).
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                                Entre em contato com o administrador se acredita que deveria ter acesso.
                            </p>
                        </div>
                    ) : (
                        formulariosVisiveis.map(form => {
                            const perguntasPermitidas = getPerguntasPermitidas(form);
                            const podeResponder = perguntasPermitidas.length > 0;
                            
                            return (
                                <div
                                    key={form.id}
                                    className="bg-white p-6 rounded-xl shadow-md border flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                                >
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-gray-800">
                                            {form.titulo}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {form.descricao}
                                        </p>
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className={`text-xs px-2 py-1 rounded-full ${podeResponder ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {perguntasPermitidas.length} pergunta(s) disponível(is)
                                            </span>
                                            {form.perfis && form.perfis.length > 0 && (
                                                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                                    Perfis permitidos: {form.perfis.join(', ')}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => podeResponder ? handleResponder(form) : alert('Você não tem permissão para responder este formulário')}
                                        className={`px-6 py-2 rounded-lg font-bold transition-all ${podeResponder ? 'bg-green-700 text-white hover:bg-green-800' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                                    >
                                        {podeResponder ? 'Responder' : 'Sem permissão'}
                                    </button>
                                </div>
                            );
                        })
                    )}
                </section>

                {/* MODAL DE RESPOSTA */}
                {modalOpen && selectedForm && (
                    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
                            {/* HEADER */}
                            <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-800">{selectedForm.titulo}</h3>
                                    <p className="text-xs text-gray-600">
                                        Perfil atual: <span className="font-semibold">{user?.perfil}</span> | 
                                        Perguntas disponíveis: <span className="font-semibold">{selectedForm.perguntasFiltradas?.length || 0}</span>
                                    </p>
                                </div>
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
                                    selectedForm.perguntasFiltradas?.length === 0 ? (
                                        <div className="text-center py-10 text-gray-500">
                                            Você não tem permissão para responder nenhuma pergunta deste formulário.
                                        </div>
                                    ) : (
                                        selectedForm.perguntasFiltradas?.map((p, i) => {
                                            // Determinar tipo para exibição
                                            let tipoExibicao = p.tipo || "texto_longo";
                                            if (!p.tipo && isStudentSelector(p.enunciado)) {
                                                tipoExibicao = "lista_alunos (detectado)";
                                            } else if (p.tipo === "texto_longo" && isStudentSelector(p.enunciado)) {
                                                tipoExibicao = "lista_alunos (detectado)";
                                            }
                                            
                                            return (
                                                <div key={p.id} className="border-b pb-6">
                                                    <div className="font-bold mb-3 text-gray-800">
                                                        {i + 1}. {p.enunciado}
                                                        {p.perfis && p.perfis.length > 0 && (
                                                            <span className="ml-2 text-xs text-blue-600">
                                                                (Permitido para: {p.perfis.join(', ')})
                                                            </span>
                                                        )}
                                                        <span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded">
                                                            {tipoExibicao === "lista_alunos" ? "Lista de Alunos" : 
                                                             tipoExibicao === "lista_alunos (detectado)" ? "Lista de Alunos (Detectado)" :
                                                             tipoExibicao === "multipla" ? "Múltipla Escolha" : 
                                                             tipoExibicao === "texto" ? "Texto Curto" : "Texto Longo"}
                                                        </span>
                                                    </div>

                                                    {renderCampoResposta(p)}
                                                </div>
                                            );
                                        })
                                    )
                                ) : (
                                    <div className="text-center py-10 text-gray-400">
                                        Selecione uma turma acima para responder as perguntas.
                                    </div>
                                )}
                            </div>

                            {/* FOOTER */}
                            <div className="p-4 border-t flex justify-end gap-2 bg-gray-50 rounded-b-xl">
                                <button
                                    onClick={() => setModalOpen(false)}
                                    className="px-4 py-2 border rounded-lg bg-white hover:bg-gray-100"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={submitResposta}
                                    disabled={!fillTurmaId || Object.keys(fill).length === 0}
                                    className={`px-6 py-2 rounded-lg font-bold ${
                                        !fillTurmaId || Object.keys(fill).length === 0
                                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                            : "bg-green-700 text-white hover:bg-green-800"
                                    }`}
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
                            alt="Foto ampliada"
                            className="max-h-[90vh] rounded-xl border-4 border-white"
                        />
                    </div>
                )}

            </div>
        </div>
    );
}   