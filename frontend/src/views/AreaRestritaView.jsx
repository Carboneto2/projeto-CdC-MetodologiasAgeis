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

    // --- AQUI ACONTECE A MÁGICA DO FILTRO ---
    const handleResponder = (form) => {
        // Filtra perguntas baseadas no perfil do usuário logado
        const permitidas = form.perguntas.filter(p => {
            // Se não tiver configuração (form antigo), mostra tudo.
            if (!p.perfis) return true;
            // Verifica se o cargo do usuário está na lista permitida da pergunta
            return p.perfis.includes(user.perfil);
        });

        if (permitidas.length === 0) {
            return alert(`Não há perguntas neste formulário para o seu perfil (${user.perfil}).`);
        }

        setSelectedForm(form);
        setPerguntasFiltradas(permitidas); // Guarda só as permitidas
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
    const isCiting = (txt) => txt.includes('Cite') || txt.includes('Relação') || txt.includes('Quais');

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-blue-900 text-white p-6 rounded-lg shadow-lg">
                <h1 className="text-2xl font-bold">Área de Colaboração</h1>
                <p>Logado como: <span className="font-bold text-yellow-300">{user?.perfil}</span></p>
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
                            <h3 className="font-bold text-lg">{selectedForm.titulo} (Visão: {user.perfil})</h3>
                            <button onClick={() => setModalOpen(false)} className="text-xl">✕</button>
                        </div>

                        <div className="p-4 bg-yellow-50 border-b">
                            <select className="w-full border p-2 rounded" value={fillTurmaId} onChange={e => setFillTurmaId(e.target.value)}>
                                <option value="">-- Selecione a Turma --</option>
                                {turmas.map(t => <option key={t.id} value={t.id}>{t.nome} - {t.ano}</option>)}
                            </select>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {fillTurmaId ? perguntasFiltradas.map((p, i) => (
                                <div key={p.id} className="border-b pb-4">
                                    <div className="font-bold mb-2">{i+1}. {p.enunciado}</div>
                                    
                                    {isCiting(p.enunciado) && p.tipo === 'texto_longo' ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-gray-50 p-2 rounded max-h-60 overflow-y-auto">
                                            {alunosDaTurma.map(a => {
                                                const sel = (fill[p.id] || []).includes(a.nome);
                                                return (
                                                    <div key={a.id} onClick={() => {
                                                        const cur = fill[p.id] || [];
                                                        setFill({...fill, [p.id]: cur.includes(a.nome) ? cur.filter(x=>x!==a.nome) : [...cur, a.nome]});
                                                    }} className={`flex items-center gap-2 p-2 rounded border cursor-pointer ${sel ? 'bg-blue-100 border-blue-500' : 'bg-white'}`}>
                                                        <div onClick={(e)=>{e.stopPropagation(); setZoomFoto(a.foto)}} className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
                                                            {a.foto && <img src={a.foto} className="w-full h-full object-cover"/>}
                                                        </div>
                                                        <span>{a.nome}</span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    ) : (
                                        p.tipo === 'multipla' ? (
                                            p.opcoes.map(op => (
                                                <label key={op} className="flex gap-2 p-1"><input type="checkbox" checked={(fill[p.id]||[]).includes(op)} onChange={e => {
                                                    const cur = fill[p.id]||[]; setFill({...fill, [p.id]: e.target.checked ? [...cur, op] : cur.filter(x=>x!==op)})
                                                }}/> {op}</label>
                                            ))
                                        ) : (
                                            <textarea className="w-full border p-2 rounded" rows={3} value={fill[p.id]||""} onChange={e=>setFill({...fill, [p.id]: e.target.value})} />
                                        )
                                    )}
                                </div>
                            )) : <div className="text-center py-4 text-gray-400">Selecione a turma para começar.</div>}
                        </div>

                        <div className="p-4 border-t flex justify-end gap-2 bg-gray-50 rounded-b-xl">
                            <button onClick={() => setModalOpen(false)} className="px-4 py-2 border rounded bg-white">Cancelar</button>
                            <button onClick={submitResposta} className="px-4 py-2 bg-green-600 text-white rounded font-bold">Enviar</button>
                        </div>
                    </div>
                </div>
            )}
             {zoomFoto && <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4" onClick={() => setZoomFoto(null)}><img src={zoomFoto} className="max-h-[90vh] rounded"/></div>}
        </div>
    );
}