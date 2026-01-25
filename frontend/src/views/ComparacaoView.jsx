import React, { useState, useMemo } from "react";
import { useForms } from "../hooks/useForms";
import { useTurmas } from "../hooks/useTurmas";
import { useAlunos } from "../hooks/useAlunos";
import Card from "../components/Card";
import Input from "../components/Input";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

export default function ComparacaoView() {
  const { forms, respostas } = useForms();
  const { turmas } = useTurmas();
  const { alunos } = useAlunos();

  const [filtroNome, setFiltroNome] = useState("");
  const [filtroTurma, setFiltroTurma] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [fotoExpandida, setFotoExpandida] = useState(null);

  const CATEGORIAS_RISCO = useMemo(
    () => [
      "Relação de Estudantes DESTAQUES (Cite os nomes):",
      "Relação de Estudantes INFREQUENTES (Cite os nomes):",
      "Discentes com MAIORES DIFICULDADES de aprendizagem (Cite os nomes):",
      "Quais estudantes NÃO atingiram a média no trimestre? (Cite os nomes):",
      "Sugestão para encaminhamento ao APOIO PSICOLÓGICO (Cite os nomes):",
      "NAE: Quais estudantes foram atendidos pelos serviços de apoio psicológico?",
      "NAE: Discentes atendidos pelo SERVIÇO SOCIAL (Cite os nomes):",
    ],
    [],
  );

  // --- CÁLCULO DO RESUMO ---
  const resumo = useMemo(() => {
    const totalAlunos = alunos.length;
    const totalTurmas = turmas.length;
    const contagemTurno = { Manhã: 0, Tarde: 0, Noite: 0 };

    turmas.forEach((t) => {
      const qtdAlunos = alunos.filter((a) => a.turmaId === t.id).length;
      if (contagemTurno[t.turno] !== undefined) {
        contagemTurno[t.turno] += qtdAlunos;
      }
    });

    const alunosPorTurno = Object.entries(contagemTurno).map(
      ([turno, count]) => ({ turno, count }),
    );
    return {
      total_alunos: totalAlunos,
      total_turmas: totalTurmas,
      alunos_por_turno: alunosPorTurno,
    };
  }, [alunos, turmas]);

  const ocorrenciasPorTurma = useMemo(() => {
    const mapa = {};

    respostas.forEach((r) => {
      const turma = turmas.find((t) => String(t.id) === String(r.turmaId));
      if (!turma) return;

      if (!mapa[turma.nome]) {
        mapa[turma.nome] = 0;
      }

      mapa[turma.nome] += 1;
    });

    return Object.entries(mapa).map(([nome, total]) => ({
      turma: nome,
      total,
    }));
  }, [respostas, turmas]);

  const statusAlunos = useMemo(() => {
    let destaques = 0;
    let dificuldades = 0;
    let infrequentes = 0;

    respostas.forEach((r) => {
      Object.values(r.payload || {}).forEach((valor) => {
        if (typeof valor !== "string") return;

        if (valor.includes("DESTAQUES")) destaques++;
        if (valor.includes("DIFICULDADES")) dificuldades++;
        if (valor.includes("INFREQUENTES")) infrequentes++;
      });
    });

    return [
      { name: "Destaques", value: destaques },
      { name: "Dificuldades", value: dificuldades },
      { name: "Infrequentes", value: infrequentes },
    ];
  }, [respostas]);

  // --- PROCESSAMENTO DAS RESPOSTAS ---
  const citacoesProcessadas = useMemo(() => {
    if (!respostas.length || !forms.length || !alunos.length) return [];

    const lista = [];
    const mapaAlunos = new Map(
      alunos.map((a) => [a.nome.trim().toLowerCase(), a]),
    );
    const mapaTurmas = new Map(turmas.map((t) => [String(t.id), t.nome]));

    respostas.forEach((r) => {
      const form = forms.find((f) => String(f.id) === String(r.formId));
      if (!form || !r.payload) return;

      const nomeTurma = mapaTurmas.get(String(r.turmaId)) || "Turma removida";

      Object.entries(r.payload).forEach(([perguntaId, respostaValor]) => {
        const pergunta = form.perguntas.find((p) => p.id === perguntaId);
        if (!pergunta) return;

        const enunciado = pergunta.enunciado;
        const ehCategoriaRisco = CATEGORIAS_RISCO.some((cat) =>
          enunciado.includes(cat.substring(0, 20)),
        );

        if (ehCategoriaRisco && typeof respostaValor === "string") {
          const nomesCitados = respostaValor
            .split("\n")
            .map((linha) => linha.replace(/^-\s*/, "").trim())
            .filter(Boolean);

          nomesCitados.forEach((nome) => {
            const dadosAluno = mapaAlunos.get(nome.toLowerCase());
            if (dadosAluno) {
              lista.push({
                id: crypto.randomUUID(),
                alunoNome: dadosAluno.nome,
                alunoMatricula: dadosAluno.matricula,
                alunoFoto: dadosAluno.foto,
                turma: nomeTurma,
                turmaId: String(r.turmaId),
                categoria: enunciado,
                data: r.data,
                formTitulo: form.titulo,
              });
            }
          });
        }
      });
    });
    return lista;
  }, [respostas, forms, alunos, turmas, CATEGORIAS_RISCO]);

  // --- FILTRAGEM ---
  const dadosFiltrados = useMemo(() => {
    return citacoesProcessadas.filter((item) => {
      const matchNome =
        filtroNome === "" ||
        item.alunoNome.toLowerCase().includes(filtroNome.toLowerCase());
      const matchTurma = filtroTurma === "" || item.turmaId === filtroTurma;
      const matchCategoria =
        filtroCategoria === "" || item.categoria === filtroCategoria;
      return matchNome && matchTurma && matchCategoria;
    });
  }, [citacoesProcessadas, filtroNome, filtroTurma, filtroCategoria]);

  const maiorContagem = Math.max(
    ...resumo.alunos_por_turno.map((t) => t.count),
    1,
  );

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card
          title="Status dos Alunos"
          subtitle="Distribuição geral a partir dos conselhos"
        >
          {statusAlunos.every((s) => s.value === 0) ? (
            <div className="h-72 flex items-center justify-center text-gray-400 text-sm">
              Nenhum conselho preenchido ainda.
            </div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusAlunos}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label
                  >
                    {statusAlunos.map((_, index) => (
                      <Cell
                        key={index}
                        fill={["#22c55e", "#facc15", "#ef4444"][index % 3]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card
          title="Ocorrências por Turma"
          subtitle="Quantidade de citações registradas"
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ocorrenciasPorTurma}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="turma" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="bg-black text-white p-5 rounded-2xl shadow">
          <div className="text-3xl font-bold">{resumo.total_alunos}</div>
          <div className="text-sm opacity-80">Total de Alunos</div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow border">
          <div className="text-3xl font-bold">{resumo.total_turmas}</div>
          <div className="text-sm text-gray-500">Turmas Cadastradas</div>
        </div>
        <div className="bg-blue-50 p-5 rounded-2xl shadow border border-blue-100">
          <div className="text-3xl font-bold text-blue-600">
            {citacoesProcessadas.length}
          </div>
          <div className="text-sm text-blue-800">Ocorrências / Citações</div>
        </div>
      </div>

      {/* Gráfico Rápido */}
      <div className="grid md:grid-cols-1 gap-6">
        <Card
          title="Distribuição de Alunos por Turno"
          subtitle="Visão geral de matrículas"
        >
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
                    <div
                      className="bg-black h-2 rounded-full transition-all duration-500"
                      style={{ width: `${porcentagem}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* --- PAINEL CENTRAL (ANTIGO RISCO) --- */}
      <Card
        title="🚩 Painel Central"
        subtitle="Monitore as citações e alertas gerados nos conselhos de classe."
        className="border-t-4 border-t-red-500"
      >
        <div className="grid md:grid-cols-3 gap-4 mb-6 bg-gray-50 p-4 rounded-xl border">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
              Buscar Aluno
            </label>
            <Input
              placeholder="Digite o nome..."
              value={filtroNome}
              onChange={(e) => setFiltroNome(e.target.value)}
              className="bg-white"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
              Filtrar por Turma
            </label>
            <select
              className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-black/10 bg-white"
              value={filtroTurma}
              onChange={(e) => setFiltroTurma(e.target.value)}
            >
              <option value="">Todas as Turmas</option>
              {turmas.map((t) => (
                <option key={t.id} value={String(t.id)}>
                  {t.nome}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
              Indicador
            </label>
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
                  <th className="py-3 px-4">Motivo da Citação</th>
                  <th className="py-3 px-4 text-right">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {dadosFiltrados.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 border cursor-zoom-in hover:border-blue-500 transition"
                          onClick={() => setFotoExpandida(item.alunoFoto)}
                        >
                          {item.alunoFoto ? (
                            <img
                              src={item.alunoFoto}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs">
                              📷
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {item.alunoNome}
                          </div>
                          <div className="text-xs text-gray-500">
                            Mat: {item.alunoMatricula || "-"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {item.turma}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div
                        className="text-gray-900 font-medium"
                        title={item.categoria}
                      >
                        {item.categoria}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {item.formTitulo}
                      </div>
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

      {fotoExpandida && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 cursor-zoom-out"
          onClick={() => setFotoExpandida(null)}
        >
          <div className="relative">
            <img
              src={fotoExpandida}
              alt="Foto Expandida"
              className="max-w-full max-h-[90vh] rounded-lg shadow-2xl border-4 border-white"
            />
            <button className="absolute -top-4 -right-4 bg-white text-black rounded-full w-8 h-8 font-bold flex items-center justify-center shadow">
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
