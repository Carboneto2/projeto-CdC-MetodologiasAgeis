import React, { useState, useEffect, useMemo } from "react";
import { useTurmas } from "../hooks/useTurmas";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = [
  "#6366F1",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
];

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
          fetch("http://localhost:5000/respostas").then((r) => r.json()),
          fetch("http://localhost:5000/formularios").then((r) => r.json()),
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
    const form = formularios.find((f) => String(f.id) === String(filtroForm));
    return form ? form.perguntas : [];
  }, [filtroForm, formularios]);

  // --- LÓGICA DE PROCESSAMENTO DE INSTÂNCIAS ---
  const dadosGraficos = useMemo(() => {
    const filtradas = respostas.filter((r) => {
      const matchTurma = filtroTurma
        ? String(r.turma_id) === String(filtroTurma)
        : true;
      const matchForm = filtroForm
        ? String(r.formulario_id) === String(filtroForm)
        : true;
      return matchTurma && matchForm;
    });

    const contagemAlunos = {};

    filtradas.forEach((item) => {
      const respObj = item.respostas;

      if (filtroPergunta) {
        // Filtro específico por pergunta (Instância)
        const valor = respObj[filtroPergunta];
        if (typeof valor === "string") {
          const nomes = valor
            .split(",")
            .map((n) => n.trim())
            .filter((n) => n.length > 2);
          nomes.forEach((nome) => {
            const itensIgnorar = [
              "Sim",
              "Não",
              "Conversas",
              "Faltas",
              "Desinteresse",
            ];
            if (!itensIgnorar.includes(nome)) {
              contagemAlunos[nome] = (contagemAlunos[nome] || 0) + 1;
            }
          });
        }
      } else {
        // Geral do formulário
        Object.values(respObj).forEach((valor) => {
          if (typeof valor === "string") {
            const nomes = valor
              .split(",")
              .map((n) => n.trim())
              .filter((n) => n.length > 2);
            nomes.forEach((nome) => {
              const itensIgnorar = [
                "Sim",
                "Não",
                "Conversas",
                "Faltas",
                "Desinteresse",
              ];
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
      barras: formatados,
    };
  }, [respostas, filtroTurma, filtroForm, filtroPergunta]);

return (
  <div className="bg-gray-100 min-h-[calc(100vh-64px)]">
    {/* CONTAINER CENTRAL */}
    <div className="max-w-7xl mx-auto p-6 space-y-6">

      {/* TÍTULO */}
      <header className="bg-white rounded-xl shadow-md border p-6 relative overflow-hidden">
        {/* detalhe vermelho igual ao login */}
        <div className="absolute top-0 left-0 w-full h-2 bg-red-700"></div>

        <h1 className="text-2xl font-bold text-green-800">
          Dashboard Analítico
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Visão geral das respostas e formulários
        </p>
      </header>

      {/* FILTROS */}
      <section className="bg-white rounded-xl shadow-md border p-6">
        <h2 className="text-sm font-bold text-green-800 uppercase mb-4">
          Filtros
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1 uppercase">
              Turma
            </label>
            <select
              className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
              value={filtroTurma}
              onChange={(e) => setFiltroTurma(e.target.value)}
            >
              <option value="">Todas as Turmas</option>
              {turmas.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1 uppercase">
              Formulário
            </label>
            <select
              className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
              value={filtroForm}
              onChange={(e) => {
                setFiltroForm(e.target.value);
                setFiltroPergunta("");
              }}
            >
              <option value="">Selecione um Modelo</option>
              {formularios.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.titulo}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1 uppercase">
              Instância da Pergunta
            </label>
            <select
              className={`w-full border p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-700
                ${
                  !filtroForm
                    ? "bg-gray-100 border-gray-200"
                    : "bg-white border-gray-300"
                }`}
              value={filtroPergunta}
              onChange={(e) => setFiltroPergunta(e.target.value)}
              disabled={!filtroForm}
            >
              <option value="">Todas as perguntas (Geral)</option>
              {perguntasDoFiltro.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.enunciado}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* GRÁFICOS */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* GRÁFICO PIZZA */}
        <div className="bg-white rounded-xl shadow-md border p-6 h-[450px] overflow-hidden">
          <h2 className="text-lg font-bold text-green-800 mb-4">
            Top Alunos Citados
          </h2>

          <div className="h-[360px]">
            {dadosGraficos.pizza.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dadosGraficos.pizza}
                    dataKey="value"
                    innerRadius={70}
                    outerRadius={110}
                    label={false}
                  >
                    {dadosGraficos.pizza.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #1b5e20",
                      borderRadius: "8px",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                      fontSize: "0.85rem",
                    }}
                    labelStyle={{
                      color: "#1b5e20",
                      fontWeight: 700,
                      marginBottom: "4px",
                    }}
                    itemStyle={{
                      color: "#000000",
                      fontWeight: 500,
                    }}
                    cursor={{ fill: "rgba(27,94,32,0.08)" }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-300">
                Sem dados.
              </div>
            )}
          </div>
        </div>

        {/* GRÁFICO BARRAS */}
        <div className="bg-white rounded-xl shadow-md border p-6 h-[450px] overflow-hidden">
          <h2 className="text-lg font-bold text-green-800 mb-4">
            Volume de Menções
          </h2>

          <div className="h-[360px]">
            {dadosGraficos.barras.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dadosGraficos.barras}
                  layout="vertical"
                  margin={{ top: 10, right: 20, left: 20, bottom: 10 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal
                    vertical={false}
                  />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={120}
                    style={{ fontSize: "12px" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #1b5e20",
                      borderRadius: "8px",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                      fontSize: "0.85rem",
                    }}
                    labelStyle={{
                      color: "#1b5e20",
                      fontWeight: 700,
                      marginBottom: "4px",
                    }}
                    itemStyle={{
                      color: "#000000",
                      fontWeight: 500,
                    }}
                    cursor={{ fill: "rgba(27,94,32,0.08)" }}
                  />
                  <Bar
                    dataKey="value"
                    fill="#1b5e20"
                    radius={[0, 6, 6, 0]}
                    barSize={24}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-300">
                Selecione os filtros acima.
              </div>
            )}
          </div>
        </div>

      </section>
    </div>
  </div>
);

}
