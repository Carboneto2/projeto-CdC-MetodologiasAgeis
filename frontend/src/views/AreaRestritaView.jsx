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
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-blue-900 text-white p-6 rounded-lg shadow-lg">
                <h1 className="text-2xl font-bold">Área de Colaboração</h1>
                <p>Perfil: <span className="font-bold text-yellow-300">{user?.perfil}</span></p>
            </div>

            <div className="grid gap-4">
                {formularios.map(form => (
                    <div key={form.id} className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500 flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-bold">{form.titulo}</h3>
                            <p className="text-gray-600">{form.descricao}</p>
                        </div>
                        <button onClick={() => handleResponder(form)} className="bg-green-600 text-white px-6 py-2 rounded font-bold hover:bg-green-700">
                            Responder
                        </button>
                    </div>
                ))}
            </div>

            {modalOpen && selectedForm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                        <div className="p-4 border-b flex justify-between bg-gray-50 rounded-t-xl">
                            <h3 className="font-bold text-lg">{selectedForm.titulo}</h3>
                            <button onClick={() => setModalOpen(false)} className="text-xl">✕</button>
                        </div>

                        <div className="p-4 bg-yellow-50 border-b">
                            <select className="w-full border p-2 rounded" value={fillTurmaId} onChange={e => setFillTurmaId(e.target.value)}>
                                <option value="">-- Selecione a Turma --</option>
                                {turmas.map(t => <option key={t.id} value={t.id}>{t.nome} - {t.ano}</option>)}
                            </select>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            {fillTurmaId ? perguntasFiltradas.map((p, i) => (
                                <div key={p.id} className="border-b pb-6">
                                    <div className="font-bold mb-3 text-lg text-gray-800">{i+1}. {p.enunciado}</div>
                                    
                                    {/* --- AQUI ESTÁ A LÓGICA DO SELETOR DE ALUNOS --- */}
                                    {/* Se for texto_longo E tiver palavras chaves como 'discente', vira lista de fotos */}
                                    {p.tipo === 'texto_longo' && isStudentSelector(p.enunciado) ? (
                                        <div className="bg-gray-50 p-3 rounded border border-gray-200">
                                            <p className="text-xs text-gray-500 mb-2 font-bold uppercase">Selecione os estudantes clicando neles:</p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                                                {alunosDaTurma.length === 0 && <p className="text-red-500 text-sm">Sem alunos nesta turma.</p>}
                                                {alunosDaTurma.map(a => {
                                                    const sel = (fill[p.id] || []).includes(a.nome);
                                                    return (
                                                        <div key={a.id} onClick={() => {
                                                            const cur = fill[p.id] || [];
                                                            setFill({...fill, [p.id]: cur.includes(a.nome) ? cur.filter(x=>x!==a.nome) : [...cur, a.nome]});
                                                        }} className={`flex items-center gap-3 p-2 rounded border cursor-pointer transition ${sel ? 'bg-blue-100 border-blue-500 shadow-sm' : 'bg-white hover:bg-gray-100'}`}>
                                                            <div onClick={(e)=>{e.stopPropagation(); setZoomFoto(a.foto)}} className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden border">
                                                                {a.foto ? <img src={a.foto} className="w-full h-full object-cover"/> : <span className="flex items-center justify-center h-full text-xs">📷</span>}
                                                            </div>
                                                            <span className={`text-sm ${sel ? 'font-bold text-blue-900' : 'text-gray-700'}`}>{a.nome}</span>
                                                            {sel && <span className="ml-auto text-blue-600">✔</span>}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                            <div className="mt-2 text-xs text-blue-800">
                                                <strong>Selecionados:</strong> {(fill[p.id] || []).join(', ') || "Nenhum"}
                                            </div>
                                        </div>
                                    ) : (
                                        /* --- CASOS NORMAIS --- */
                                        p.tipo === 'multipla' ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                {p.opcoes.map(op => (
                                                    <label key={op} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer border border-transparent hover:border-gray-200">
                                                        <input type="checkbox" className="w-4 h-4 accent-blue-600" checked={(fill[p.id]||[]).includes(op)} onChange={e => {
                                                            const cur = fill[p.id]||[]; setFill({...fill, [p.id]: e.target.checked ? [...cur, op] : cur.filter(x=>x!==op)})
                                                        }}/> 
                                                        <span className="text-sm">{op}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        ) : (
                                            <textarea className="w-full border p-3 rounded focus:border-blue-500 outline-none" rows={3} placeholder="Digite sua resposta..." value={fill[p.id]||""} onChange={e=>setFill({...fill, [p.id]: e.target.value})} />
                                        )
                                    )}
                                </div>
                            )) : <div className="text-center py-10 text-gray-400">Selecione uma turma acima.</div>}
                        </div>

                        <div className="p-4 border-t flex justify-end gap-2 bg-gray-50 rounded-b-xl">
                            <button onClick={() => setModalOpen(false)} className="px-4 py-2 border rounded bg-white hover:bg-gray-100">Cancelar</button>
                            <button onClick={submitResposta} className="px-6 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700 shadow">Enviar</button>
                        </div>
                    </div>
                </div>
            )}
             {zoomFoto && <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4" onClick={() => setZoomFoto(null)}><img src={zoomFoto} className="max-h-[90vh] rounded border-4 border-white"/></div>}
        </div>
    );
}