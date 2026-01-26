import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTurmas } from "../hooks/useTurmas";
import { useAlunos } from "../hooks/useAlunos";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import { Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function ComparacaoView() {
  const { turmas } = useTurmas();
  const { alunos } = useAlunos();

  // Estados dos Dados
  const [formularios, setFormularios] = useState([]);
  const [todasRespostas, setTodasRespostas] = useState([]);
  const [usuarios, setUsuarios] = useState([]); // Corrigido de userState para useState

  // Filtros
  const [filtroTurma, setFiltroTurma] = useState("");
  const [filtroForm, setFiltroForm] = useState("");

  const relatorioRef = useRef(null);

  // --- 1. CARREGAR DADOS DO BACKEND ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resForms, resRespostas, resUsuarios] = await Promise.all([
          fetch('http://localhost:5000/formularios'),
          fetch('http://localhost:5000/respostas'),
          fetch('http://localhost:5000/usuarios')
        ]);

        if (resForms.ok) setFormularios(await resForms.json());
        if (resRespostas.ok) setTodasRespostas(await resRespostas.json());
        if (resUsuarios.ok) setUsuarios(await resUsuarios.json());
      } catch (e) {
        console.error("Erro ao carregar dados:", e);
      }
    };

    fetchData();
  }, []);

  // --- 2. GERAÇÃO DE PDF ---
  const gerarPDF = async () => {
    if (!relatorioRef.current) return;

    const canvas = await html2canvas(relatorioRef.current, {
      scale: 2,
      useCORS: true,
      ignoreElements: (element) => element.classList?.contains("no-print"),
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position -= pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`relatorio-turma-${filtroTurma}.pdf`);
  };

  // --- 3. PROCESSAMENTO DOS DADOS ---

  // A. Estatísticas da Turma
  const statsTurma = useMemo(() => {
    if (!filtroTurma) return null;
    const alunosDaTurma = alunos.filter(a => String(a.turmaId) === String(filtroTurma));
    const total = alunosDaTurma.length;
    if (total === 0) return { total: 0, emRisco: 0, bons: 0, excelentes: 0 };

    return {
      total,
      emRisco: Math.floor(total * 0.2),
      bons: Math.floor(total * 0.5),
      excelentes: Math.floor(total * 0.3)
    };
  }, [alunos, filtroTurma]);

  // B. Consolidação Qualitativa e Participantes
  // B. Consolidação Qualitativa e Participantes
  const relatorioQualitativo = useMemo(() => {
    if (!filtroForm || !filtroTurma || formularios.length === 0) return null;

    const modelo = formularios.find(f => String(f.id) === String(filtroForm));
    if (!modelo) return null;

    const respostasFiltradas = todasRespostas.filter(r =>
      String(r.formulario_id) === String(filtroForm) &&
      String(r.turma_id) === String(filtroTurma)
    );
    const listaDeNomes = respostasFiltradas.map((resp, index) => {
      const idRespondente = resp.idusuario || resp.usuario_id || resp.userId || resp.id;
      
      const usuario = usuarios.find(u => String(u.idusuario) === String(idRespondente));
      
      if (usuario) {
        return usuario.nome;
      } else {
        return resp.autor || resp.nome || `Respondente ${index + 1} (ID: ${idRespondente})`;
      }
    });

    const nomesUnicos = [...new Set(listaDeNomes)].filter(Boolean);

    console.log("Lista final de nomes únicos gerada:", nomesUnicos);

    const consolidado = modelo.perguntas.map(pergunta => {
      const respostasDestaPergunta = respostasFiltradas
        .map(r => r.respostas[pergunta.id])
        .filter(Boolean);

      return {
        id: pergunta.id,
        enunciado: pergunta.enunciado,
        tipo: pergunta.tipo,
        respostas: respostasDestaPergunta
      };
    });

    return {
      totalParticipantes: respostasFiltradas.length,
      nomesParticipantes: nomesUnicos,
      questoes: consolidado
    };

  }, [formularios, todasRespostas, usuarios, filtroForm, filtroTurma]);

  const COLORS = ['#FF8042', '#0088FE', '#00C49F'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Relatórios do Conselho</h2>
        <div className="text-sm text-gray-500">
          Respostas no Sistema: <span className="font-bold text-black">{todasRespostas.length}</span>
        </div>
      </div>

      {/* --- FILTROS --- */}
      <div className="bg-white p-4 rounded-lg shadow border flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-bold text-gray-700 mb-1">1. Escolha a Turma</label>
          <select
            className="w-full border p-2 rounded bg-gray-50"
            value={filtroTurma}
            onChange={e => setFiltroTurma(e.target.value)}
          >
            <option value="">-- Selecione --</option>
            {turmas.map(t => <option key={t.id} value={t.id}>{t.nome} - {t.ano}</option>)}
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-bold text-gray-700 mb-1">2. Escolha o Questionário</label>
          <select
            className="w-full border p-2 rounded bg-gray-50"
            value={filtroForm}
            onChange={e => setFiltroForm(e.target.value)}
          >
            <option value="">-- Selecione --</option>
            {formularios.map(f => <option key={f.id} value={f.id}>{f.titulo}</option>)}
          </select>
        </div>
      </div>

      {/* --- RELATÓRIO --- */}
      {filtroTurma && filtroForm && relatorioQualitativo ? (
        <div ref={relatorioRef} className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-white p-4">
          
          {/* COLUNA ESQUERDA: ESTATÍSTICAS */}
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-lg shadow border-l-4 border-blue-900">
              <h3 className="font-bold text-lg mb-2 text-blue-900">Visão da Turma</h3>
              {statsTurma && (
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Total de Alunos:</span>
                    <span className="font-bold">{statsTurma.total}</span>
                  </div>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          isAnimationActive={false}
                          data={[
                            { name: 'Em Risco', value: statsTurma.emRisco },
                            { name: 'Regulares', value: statsTurma.bons },
                            { name: 'Excelentes', value: statsTurma.excelentes },
                          ]}
                          cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value"
                        >
                          {COLORS.map((color, i) => <Cell key={i} fill={color} />)}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>

            {/* CARD DE PARTICIPAÇÃO COM LISTA DE NOMES */}
            <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
              <h3 className="font-bold text-blue-900 mb-1">Participação</h3>
              <p className="text-3xl font-bold text-blue-900">{relatorioQualitativo.totalParticipantes}</p>
              <p className="text-sm text-blue-700 mb-4">Docentes/Equipe que responderam</p>
              
              <div className="border-t border-blue-200 pt-3">
                <p className="text-xs font-bold text-blue-800 uppercase mb-2">Respondentes:</p>
                {relatorioQualitativo.nomesParticipantes.length > 0 ? (
                  <ul className="text-sm text-blue-900 space-y-1 max-h-60 overflow-y-auto">
                    {relatorioQualitativo.nomesParticipantes.map((nome, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0"></span>
                        {nome}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-blue-400 italic">Nenhum respondente identificado</p>
                )}
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA: QUESTÕES */}
          <div className="lg:col-span-2 space-y-4">
            {relatorioQualitativo.questoes.map((q, idx) => (
              <div key={q.id} className="bg-white p-5 rounded-lg shadow-sm border">
                <h4 className="font-bold text-gray-800 mb-3 flex gap-2">
                  <span className="bg-gray-200 text-gray-600 px-2 rounded text-sm flex items-center">{idx + 1}</span>
                  {q.enunciado}
                </h4>

                {q.respostas.length === 0 ? (
                  <p className="text-gray-400 italic text-sm">Sem respostas registradas.</p>
                ) : (
                  <div className="space-y-2">
                    {q.enunciado.includes("Cite") || q.enunciado.includes("Quais") ? (
                      <div className="flex flex-wrap gap-2">
                        {q.respostas.join(', ').split(', ').filter(Boolean).map((nome, i) => (
                          <span key={i} className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm border border-yellow-200 font-medium">
                            👤 {nome}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <ul className="list-disc list-inside space-y-1">
                        {q.respostas.map((resp, i) => (
                          <li key={i} className="text-gray-700 text-sm bg-gray-50 p-2 rounded list-none">
                            {resp}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            ))}

            <button
              onClick={gerarPDF}
              className="w-full bg-green-800 text-white px-4 py-3 rounded-lg hover:bg-green-900 transition font-bold no-print"
            >
              📄 Exportar Relatório em PDF
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 border-2 border-dashed rounded-xl">
          <p className="text-xl text-gray-400 font-medium">Selecione uma Turma e um Questionário para visualizar os dados.</p>
        </div>
      )}
    </div>
  );
}