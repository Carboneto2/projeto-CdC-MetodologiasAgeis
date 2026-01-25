import React, { useState, useEffect } from 'react';

export default function GestaoUsuariosView() {
    const [usuarios, setUsuarios] = useState([]);
    const [form, setForm] = useState({ nome: '', login: '', senha: '', perfil: '' });

    // CARGOS PERMITIDOS
    const perfis = [
        "Coordenador",
        "Docente",
        "NAE - Atendimento Psicológico",
        "NAE - Assistente Social",
        "NAE - Assistente de Aluno",
        "NAPNE",
        "NEABI",
        "NEPGES"
    ];

    const carregarUsuarios = async () => {
        try {
            const res = await fetch('http://localhost:5000/usuarios');
            if(res.ok) setUsuarios(await res.json());
        } catch (e) { console.error(e); }
    };

    useEffect(() => { carregarUsuarios(); }, []);

    const salvarUsuario = async () => {
        if (!form.nome || !form.login || !form.senha || !form.perfil) return alert("Preencha tudo!");
        
        const res = await fetch('http://localhost:5000/usuarios', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(form)
        });

        if (res.ok) {
            alert("Usuário cadastrado!");
            setForm({ nome: '', login: '', senha: '', perfil: '' });
            carregarUsuarios();
        } else {
            alert("Erro ao cadastrar (Login duplicado?)");
        }
    };

    const excluirUsuario = async (id) => {
        if(!window.confirm("Remover acesso deste usuário?")) return;
        await fetch(`http://localhost:5000/usuarios/${id}`, { method: 'DELETE' });
        carregarUsuarios();
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Gestão de Acessos</h2>

            {/* CARD DE CADASTRO */}
            <div className="bg-white p-6 rounded-lg shadow-md border">
                <h3 className="font-bold mb-4">Novo Usuário</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input className="border p-2 rounded" placeholder="Nome Completo" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} />
                    <input className="border p-2 rounded" placeholder="Login de Acesso" value={form.login} onChange={e => setForm({...form, login: e.target.value})} />
                    <input className="border p-2 rounded" type="password" placeholder="Senha" value={form.senha} onChange={e => setForm({...form, senha: e.target.value})} />
                    
                    <select className="border p-2 rounded bg-white" value={form.perfil} onChange={e => setForm({...form, perfil: e.target.value})}>
                        <option value="">Selecione o Cargo...</option>
                        {perfis.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>

                    <button onClick={salvarUsuario} className="col-span-full bg-blue-900 text-white p-2 rounded font-bold hover:bg-blue-800">
                        + Cadastrar Usuário
                    </button>
                </div>
            </div>

            {/* LISTA DE USUÁRIOS */}
            <div className="bg-white p-6 rounded-lg shadow-md border">
                <h3 className="font-bold mb-4">Usuários Ativos ({usuarios.length})</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-4 py-3">Nome</th>
                                <th className="px-4 py-3">Login</th>
                                <th className="px-4 py-3">Perfil</th>
                                <th className="px-4 py-3 text-right">Ação</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuarios.map(u => (
                                <tr key={u.idusuario} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium text-gray-900">{u.nome}</td>
                                    <td className="px-4 py-3">{u.login}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded text-xs text-white ${u.perfil === 'Coordenador' ? 'bg-purple-600' : 'bg-gray-500'}`}>
                                            {u.perfil}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button onClick={() => excluirUsuario(u.idusuario)} className="text-red-600 hover:text-red-900 font-bold">Excluir</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}