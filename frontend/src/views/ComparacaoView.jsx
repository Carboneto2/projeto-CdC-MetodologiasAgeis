import React, { useEffect, useState, useMemo } from "react";
import Card from "../components/Card";
import Input from "../components/Input";

export default function ComparacaoView() {
  const [loading, setLoading] = useState(true);
  
  // Dados Brutos
  const [resumo, setResumo] = useState(null);
  const [forms, setForms] = useState([]);
  const [respostas, setRespostas] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [alunos, setAlunos] = useState([]);

  // Filtros
  const [filtroNome, setFiltroNome] = useState("");
  const [filtroTurma, setFiltroTurma] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");

  // Estado para o Zoom da Foto
  const [fotoExpandida, setFotoExpandida] = useState(null);

  // Categorias de Risco
  const CATEGORIAS_RISCO = [
    "Qual(is) é(são) o(s) estudante(s) destaque(s)?",
    "Qual(is) é(são) o(s) estudante(s) infrequente(s)?",
    "Qual(is) é(são) o(s) discente(s) com maior(es) dificuldade(s) de aprendizagem?",
    "Quais estudantes não atingiram a média (nota) no trimestre?",
    "Você sugere que algum estudante seja encaminhado ao atendimento psicológico? Se sim, qual(is)?",
    "NAE — Discentes atendidos pelo serviço de apoio psicológico: Qual(is) estudante(s) foi(ram) atendido(s)?",
    "NAE — Discentes atendidos pelo serviço social: Qual(is) estudante(s) com necessidades específicas foi(ram) atendido(s)?"
  ];

  useEffect(() => {
    Promise.all([
      fetch("http://127.0.0.1:5000/api/dashboard/resumo").then(res => res.json()),
      fetch("http://127.0.0.1:5000/api/forms").then(res => res.json()),
      fetch("http://127.0.0.1:5000/api/respostas").then(res => res.json()),
      fetch("http://127.0.0.1:5000/api/turmas").then(res => res.json()),
      fetch("http://127.0.0.1:5000/api/alunos").then(res => res.json())
    ])
    .then(([resumoData, formsData, respostasData, turmasData, alunosData]) => {
      setResumo(resumoData);
      setForms(formsData);
      setRespostas(respostasData);
      setTurmas(turmasData);
      setAlunos(alunosData);
      setLoading(false);
    })
    .catch((err) => console.error("Erro ao carregar dados:", err));
  }, []);

  // --- PROCESSAMENTO ---
  const citacoesProcessadas = useMemo(() => {
    if (!respostas.length || !forms.length || !alunos.length) return [];

    const lista = [];
    const mapaAlunos = new Map(alunos.map(a => [a.nome, a]));
    const mapaTurmas = new Map(turmas.map(t => [String(t.id), t.nome]));

    respostas.forEach(r => {
      const form = forms.find(f => String(f.id) === String(r.formId));
      if (!form || !r.payload) return;

      const nomeTurma = mapaTurmas.get(String(r.turmaId)) || "Turma removida";

      Object.entries(r.payload).forEach(([perguntaId, respostaValor]) => {
        const pergunta = form.perguntas.find(p => p.id === perguntaId);
        const enunciado = pergunta ? pergunta.enunciado : "Pergunta removida";

        // Verifica se a resposta é um Array (Múltipla Escolha) ou String
        const valores = Array.isArray(respostaValor) ? respostaValor : [respostaValor];

        valores.forEach(valor => {
            if (mapaAlunos.has(valor)) {
                const dadosAluno = mapaAlunos.get(valor);
                
                lista.push({
                  id: crypto.randomUUID(),
                  alunoNome: dadosAluno.nome,
                  alunoMatricula: dadosAluno.matricula,
                  alunoFoto: dadosAluno.foto_url,
                  turma: nomeTurma,
                  turmaId: String(r.turmaId),
                  categoria: enunciado,
                  data: r.data,
                  formTitulo: form.titulo
                });
              }
        });
      });
    });

    return lista;
  }, [respostas, forms, alunos, turmas]);

  // --- FILTRAGEM ---
  const dadosFiltrados = useMemo(() => {
    return citacoesProcessadas.filter(item => {
      const matchNome = filtroNome === "" || item.alunoNome.toLowerCase().includes(filtroNome.toLowerCase());
      const matchTurma = filtroTurma === "" || item.turmaId === filtroTurma;
      const matchCategoria = filtroCategoria === "" || item.categoria.includes(filtroCategoria);
      return matchNome && matchTurma && matchCategoria;
    });
  }, [citacoesProcessadas, filtroNome, filtroTurma, filtroCategoria]);


  if (loading) return <div className="p-8 text-center text-gray-500">Carregando painel de inteligência...</div>;
  if (!resumo) return <div className="p-8 text-center text-red-500">Erro ao conectar com o servidor.</div>;

  const maiorContagem = Math.max(...resumo.alunos_por_turno.map((t) => t.count), 1);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-black text-white p-5 rounded-2xl shadow">
          <div className="text-3xl font-bold">{resumo.total_alunos}</div>
          <div className="text-sm opacity-80">Total de Alunos</div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow border">
          <div className="text-3xl font-bold">{resumo.total_turmas}</div>
          <div className="text-sm text-gray-500">Turmas Cadastradas</div>
        </div>
        <div className="bg-blue-50 p-5 rounded-2xl shadow border border-blue-100">
          <div className="text-3xl font-bold text-blue-600">{citacoesProcessadas.length}</div>
          <div className="text-sm text-blue-800">Citações Totais em Conselhos</div>
        </div>
      </div>

      {/* Gráfico Rápido */}
      <div className="grid md:grid-cols-1 gap-6">
        <Card title="Distribuição de Alunos por Turno" subtitle="Visão geral de matrículas">
          <div className="space-y-3 mt-2">
            {resumo.alunos_por_turno.map((item) => {
              const porcentagem = (item.count / maiorContagem) * 100;
              return (
                <div key={item.turno}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{item.turno}</span>
                    <span className="text-gray-500">{item.count}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-black h-2 rounded-full transition-all duration-500" style={{ width: `${porcentagem}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* --- PAINEL DE RISCO AVANÇADO --- */}
      <Card 
        title="🚩 Painel de Monitoramento Pedagógico" 
        subtitle="Filtre as citações dos alunos nos conselhos de classe"
        className="border-t-4 border-t-red-500"
      >
        {/* BARRA DE FILTROS */}
        <div className="grid md:grid-cols-3 gap-4 mb-6 bg-gray-50 p-4 rounded-xl border">
          
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Buscar Aluno</label>
            <Input 
              placeholder="Digite o nome..." 
              value={filtroNome}
              onChange={(e) => setFiltroNome(e.target.value)}
              className="bg-white"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Filtrar por Turma</label>
            <select 
              className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-black/10 bg-white"
              value={filtroTurma}
              onChange={(e) => setFiltroTurma(e.target.value)}
            >
              <option value="">Todas as Turmas</option>
              {turmas.map(t => (
                <option key={t.id} value={String(t.id)}>{t.nome}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Categoria / Indicador</label>
            <select 
              className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-black/10 bg-white text-sm"
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
            >
              <option value="">Todas as Citações</option>
              {CATEGORIAS_RISCO.map((cat, i) => (
                <option key={i} value={cat}>
                  {cat.length > 50 ? cat.substring(0, 50) + "..." : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* TABELA DE RESULTADOS */}
        {dadosFiltrados.length === 0 ? (
          <div className="p-8 text-center text-gray-400 border-2 border-dashed rounded-xl">
            Nenhuma citação encontrada com esses filtros.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 border-b">
                <tr>
                  <th className="py-3 px-4">Aluno</th>
                  <th className="py-3 px-4">Turma</th>
                  <th className="py-3 px-4">Categoria / Motivo da Citação</th>
                  <th className="py-3 px-4 text-right">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {dadosFiltrados.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {/* FOTO CLICÁVEL */}
                        {item.alunoFoto ? (
                          <img 
                            src={item.alunoFoto} 
                            alt="" 
                            className="w-8 h-8 rounded-full object-cover border cursor-zoom-in hover:scale-110 transition-transform" 
                            onClick={() => setFotoExpandida(item.alunoFoto)}
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                            {item.alunoNome.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-gray-900">{item.alunoNome}</div>
                          <div className="text-xs text-gray-500">Mat: {item.alunoMatricula || "-"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {item.turma}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-gray-900 font-medium line-clamp-2" title={item.categoria}>
                        {item.categoria}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">{item.formTitulo}</div>
                    </td>
                    <td className="py-3 px-4 text-right text-gray-500 whitespace-nowrap">
                      {new Date(item.data).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* MODAL DE ZOOM DA FOTO */}
      {fotoExpandida && (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 cursor-zoom-out"
            onClick={() => setFotoExpandida(null)}
        >
            <div className="relative max-w-3xl max-h-full">
                <img 
                    src={fotoExpandida} 
                    alt="Foto do Aluno Expandida" 
                    className="max-w-full max-h-[90vh] rounded-lg shadow-2xl border-4 border-white"
                />
                <button 
                    className="absolute -top-4 -right-4 bg-white text-black rounded-full w-8 h-8 flex items-center justify-center font-bold shadow-lg hover:bg-gray-200"
                    onClick={() => setFotoExpandida(null)}
                >
                    ✕
                </button>
            </div>
        </div>
      )}
    </div>
  );
}