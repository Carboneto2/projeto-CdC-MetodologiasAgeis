import React, { useState, useEffect, useMemo } from "react";
import { useTurmas } from "../hooks/useTurmas"; 
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from "recharts";

const COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

export default function Dashboard() {
  const { turmas } = useTurmas(); 
  const [respostas, setRespostas] = useState([]);
  const [formularios, setFormularios] = useState([]);
  const [filtroTurma, setFiltroTurma] = useState("");
  const [filtroForm, setFiltroForm] = useState("");
  const [filtroPergunta, setFiltroPergunta] = useState(""); 

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [resRespostas, resForms] = await Promise.all([
          fetch("http://localhost:5000/respostas").then(r => r.json()),
          fetch("http://localhost:5000/formularios").then(r => r.json())
        ]);
        setRespostas(resRespostas);
        setFormularios(resForms);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    };
    carregarDados();
  }, []);

  // --- BUSCA PERGUNTAS DO FORMULÁRIO SELECIONADO ---
  const perguntasDoFiltro = useMemo(() => {
    const form = formularios.find(f => String(f.id) === String(filtroForm));
    return form ? form.perguntas : [];
  }, [filtroForm, formularios]);

  // --- LÓGICA DE PROCESSAMENTO DE INSTÂNCIAS ---
  const dadosGraficos = useMemo(() => {
    const filtradas = respostas.filter(r => {
      const matchTurma = filtroTurma ? String(r.turma_id) === String(filtroTurma) : true;
      const matchForm = filtroForm ? String(r.formulario_id) === String(filtroForm) : true;
      return matchTurma && matchForm;
    });

    const contagemAlunos = {};

    filtradas.forEach(item => {
      const respObj = item.respostas;

      if (filtroPergunta) {
        // Filtro específico por pergunta (Instância)
        const valor = respObj[filtroPergunta];
        if (typeof valor === "string") {
          const nomes = valor.split(',').map(n => n.trim()).filter(n => n.length > 2);
          nomes.forEach(nome => {
            const itensIgnorar = ["Sim", "Não", "Conversas", "Faltas", "Desinteresse"];
            if (!itensIgnorar.includes(nome)) {
              contagemAlunos[nome] = (contagemAlunos[nome] || 0) + 1;
            }
          });
        }
      } else {
        // Geral do formulário
        Object.values(respObj).forEach(valor => {
          if (typeof valor === "string") {
            const nomes = valor.split(',').map(n => n.trim()).filter(n => n.length > 2);
            nomes.forEach(nome => {
              const itensIgnorar = ["Sim", "Não", "Conversas", "Faltas", "Desinteresse"];
              if (!itensIgnorar.includes(nome)) {
                contagemAlunos[nome] = (contagemAlunos[nome] || 0) + 1;
              }
            });
          }
        });
      }
    });

    const formatados = Object.entries(contagemAlunos)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return {
      pizza: formatados.slice(0, 7),
      barras: formatados
    };
  }, [respostas, filtroTurma, filtroForm, filtroPergunta]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard Analítico</h1>

      {/* FILTROS */}
      <div className="bg-white p-4 rounded-xl shadow-sm border grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-bold text-gray-400 block mb-1 uppercase">1. Turma</label>
          <select 
            className="w-full border p-2 rounded text-sm"
            value={filtroTurma}
            onChange={e => setFiltroTurma(e.target.value)}
          >
            <option value="">Todas as Turmas</option>
            {turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-400 block mb-1 uppercase">2. Formulário</label>
          <select 
            className="w-full border p-2 rounded text-sm"
            value={filtroForm}
            onChange={e => {
                setFiltroForm(e.target.value);
                setFiltroPergunta(""); 
            }}
          >
            <option value="">Selecione um Modelo</option>
            {formularios.map(f => <option key={f.id} value={f.id}>{f.titulo}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-indigo-600 block mb-1 uppercase">3. Instância da Pergunta</label>
          <select 
            className={`w-full border p-2 rounded text-sm outline-none ${!filtroForm ? 'bg-gray-100' : 'bg-indigo-50 border-indigo-200'}`}
            value={filtroPergunta}
            onChange={e => setFiltroPergunta(e.target.value)}
            disabled={!filtroForm}
          >
            <option value="">Todas as perguntas (Geral)</option>
            {/* CORRIGIDO: perguntasDoFiltro (com 'a') */}
            {perguntasDoFiltro.map(p => (
              <option key={p.id} value={p.id}>{p.enunciado}</option>
            ))}
          </select>
        </div>
      </div>

      {/* GRÁFICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md border h-[450px]">
          <h2 className="text-lg font-bold text-gray-700 mb-4">Top Alunos Citados</h2>
          {dadosGraficos.pizza.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={dadosGraficos.pizza} dataKey="value" innerRadius={60} outerRadius={100} label={({name}) => name}>
                  {dadosGraficos.pizza.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-300">Sem dados.</div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border h-[450px]">
          <h2 className="text-lg font-bold text-gray-700 mb-4">Volume de Menções</h2>
          {dadosGraficos.barras.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosGraficos.barras} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={120} style={{fontSize: '12px'}} />
                <Tooltip />
                <Bar dataKey="value" fill="#6366F1" radius={[0, 4, 4, 0]} barSize={25} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-300">Selecione os filtros acima.</div>
          )}
        </div>
      </div>
    </div>
  );
}