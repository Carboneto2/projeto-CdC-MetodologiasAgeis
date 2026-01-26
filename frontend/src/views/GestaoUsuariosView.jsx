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
  <div className="bg-gray-100 min-h-[calc(100vh-64px)]">
    <div className="max-w-7xl mx-auto p-6 space-y-6">

      {/* CABEÇALHO */}
      <header className="bg-white rounded-xl shadow-md border p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-red-700"></div>
        <h1 className="text-2xl font-bold text-green-800">
          Gestão de Usuários
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Controle de acessos ao sistema
        </p>
      </header>

      {/* CADASTRO */}
      <section className="bg-white p-6 rounded-xl shadow-md border space-y-4">
        <h2 className="font-bold text-green-800">
          Novo usuário
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700"
            placeholder="Nome completo"
            value={form.nome}
            onChange={e => setForm({ ...form, nome: e.target.value })}
          />

          <input
            className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700"
            placeholder="Login de acesso"
            value={form.login}
            onChange={e => setForm({ ...form, login: e.target.value })}
          />

          <input
            type="password"
            className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700"
            placeholder="Senha inicial"
            value={form.senha}
            onChange={e => setForm({ ...form, senha: e.target.value })}
          />

          <select
            className="border border-gray-300 p-2 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-700"
            value={form.perfil}
            onChange={e => setForm({ ...form, perfil: e.target.value })}
          >
            <option value="">Selecione o perfil</option>
            {perfis.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          <button
            onClick={salvarUsuario}
            className="md:col-span-2 bg-green-700 text-white p-3 rounded-xl font-bold hover:bg-green-800 transition-all"
          >
            Cadastrar usuário
          </button>
        </div>
      </section>

      {/* LISTAGEM */}
      <section className="bg-white p-6 rounded-xl shadow-md border">
        <h2 className="font-bold mb-4 text-green-800">
          Usuários ativos ({usuarios.length})
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-gray-50">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Login</th>
                <th className="px-4 py-3">Perfil</th>
                <th className="px-4 py-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr
                  key={u.idusuario}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {u.nome}
                  </td>
                  <td className="px-4 py-3">
                    {u.login}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-700">
                      {u.perfil}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => excluirUsuario(u.idusuario)}
                      className="text-red-600 hover:text-red-800 font-bold"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  </div>
);

}