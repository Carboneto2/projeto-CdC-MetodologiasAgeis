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
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [filtroTurma, setFiltroTurma] = useState("");
  const [filtroForm, setFiltroForm] = useState("");
  const [filtroUsuario, setFiltroUsuario] = useState(null);

  const relatorioRef = useRef(null);

  // --- 1. CARREGAR DADOS DO BACKEND ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Resetar o filtro de usuário ao trocar de turma ou formulário
  useEffect(() => {
    setFiltroUsuario(null);
  }, [filtroTurma, filtroForm]);

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
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const pageHeight = pdf.internal.pageSize.getHeight();

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

    pdf.save(`relatorio-conselho-${filtroTurma}.pdf`);
  };

  // --- FUNÇÃO AUXILIAR PARA EXTRAIR ID DO USUÁRIO ---
  const extrairUsuarioId = (resposta) => {
    // Tenta todas as combinações possíveis de IDs
    // Verifica se a resposta é um objeto válido
    if (!resposta) return null;
    
    // Testa todas as propriedades possíveis que podem conter o ID do usuário
    const possibleKeys = ['idusuario', 'usuario_id', 'usuarioId', 'id_usuario', 'userId', 'usuario', 'idUsuario', 'id'];
    
    for (const key of possibleKeys) {
      if (resposta[key] !== undefined && resposta[key] !== null && resposta[key] !== '') {
        return String(resposta[key]);
      }
    }
    
    return null;
  };

  // --- FUNÇÃO AUXILIAR PARA ENCONTRAR NOME DO USUÁRIO ---
  const encontrarNomeUsuario = (usuarioId) => {
    if (!usuarioId) return `Usuário Desconhecido`;
    
    const usuario = usuarios.find(u => {
      // Verifica todas as propriedades possíveis no objeto usuário
      const possibleUserKeys = ['idusuario', 'id', 'usuario_id', 'userId', 'usuarioId', 'id_usuario', 'idUsuario'];
      
      for (const key of possibleUserKeys) {
        if (u[key] !== undefined && u[key] !== null && String(u[key]) === String(usuarioId)) {
          return true;
        }
      }
      return false;
    });
    
    if (usuario) {
      return usuario.nome || usuario.username || usuario.email || `Usuário ${usuarioId}`;
    }
    
    return `Usuário ${usuarioId}`;
  };

  // --- 3. PROCESSAMENTO DOS DADOS (MEMO) ---

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

 const relatorioQualitativo = useMemo(() => {
    if (!filtroForm || !filtroTurma || formularios.length === 0) return null;

    const modelo = formularios.find(f => String(f.id) === String(filtroForm));
    if (!modelo) return null;

    let respostasBase = todasRespostas.filter(r =>
      String(r.formulario_id) === String(filtroForm) &&
      String(r.turma_id) === String(filtroTurma)
    );


    // --- LOGICA CORRIGIDA PARA OS BOTÕES ---
    const participantesMap = {};
    
    respostasBase.forEach(resp => {
      const usuarioId = extrairUsuarioId(resp);
      
      
      if (!usuarioId) {
        console.warn('Não foi possível extrair ID do usuário da resposta:', resp);
        return;
      }

      if (!participantesMap[usuarioId]) {
        const nomeUsuario = encontrarNomeUsuario(usuarioId);
        participantesMap[usuarioId] = { 
            id: usuarioId, 
            nome: nomeUsuario
        };
      }
    });
    
    const listaParticipantes = Object.values(participantesMap);
    
    // ------------------------------------------

    const respostasParaExibir = filtroUsuario 
      ? respostasBase.filter(r => {
          const respUsuarioId = extrairUsuarioId(r);
          return respUsuarioId && String(respUsuarioId) === String(filtroUsuario);
        })
      : respostasBase;

    const consolidado = modelo.perguntas.map(pergunta => {
      const respostasDestaPergunta = respostasParaExibir
        .map(r => r.respostas ? r.respostas[pergunta.id] : null)
        .filter(Boolean);

      return {
        id: pergunta.id,
        enunciado: pergunta.enunciado,
        respostas: respostasDestaPergunta
      };
    });

    return {
      totalGeral: respostasBase.length,
      totalFiltrado: respostasParaExibir.length,
      participantes: listaParticipantes,
      questoes: consolidado
    };

  }, [formularios, todasRespostas, usuarios, filtroForm, filtroTurma, filtroUsuario]);

  const COLORS = ['#FF8042', '#0088FE', '#00C49F'];

  if (loading) return <div className="p-10 text-center font-bold">Carregando dados do conselho...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Relatórios do Conselho</h2>
      </div>

      {/* --- BARRA DE FILTROS --- */}
      <div className="bg-white p-4 rounded-lg shadow border flex flex-wrap gap-4 items-end no-print">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-bold text-gray-700 mb-1">1. Escolha a Turma</label>
          <select
            className="w-full border p-2 rounded bg-gray-50 focus:ring-2 focus:ring-blue-900 outline-none"
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
            className="w-full border p-2 rounded bg-gray-50 focus:ring-2 focus:ring-blue-900 outline-none"
            value={filtroForm}
            onChange={e => setFiltroForm(e.target.value)}
          >
            <option value="">-- Selecione --</option>
            {formularios.map(f => <option key={f.id} value={f.id}>{f.titulo}</option>)}
          </select>
        </div>
      </div>

      {/* --- CONTEÚDO DO RELATÓRIO --- */}
      {filtroTurma && filtroForm && relatorioQualitativo ? (
        <div ref={relatorioRef} className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-white p-4">
          
          {/* COLUNA ESQUERDA */}
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-lg shadow border-l-4 border-blue-900">
              <h3 className="font-bold text-lg mb-2 text-blue-900">Visão da Turma</h3>
              {statsTurma && (
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
              )}
            </div>

            {/* CARD DE PARTICIPAÇÃO INTERATIVO */}
            <div className="bg-blue-50 p-5 rounded-lg border border-blue-100 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-blue-900">Participação</h3>
                {filtroUsuario && (
                  <button 
                    onClick={() => setFiltroUsuario(null)}
                    className="text-[10px] bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 font-bold transition no-print"
                  >
                    LIMPAR FILTRO
                  </button>
                )}
              </div>
              <p className="text-3xl font-bold text-blue-900">{relatorioQualitativo.totalFiltrado}</p>
              <p className="text-xs text-blue-700 mb-4 italic">
                {filtroUsuario ? "Exibindo apenas um respondente" : `Total de ${relatorioQualitativo.totalGeral} respostas enviadas`}
              </p>
              
              {relatorioQualitativo.participantes.length > 0 ? (
                <div className="border-t border-blue-200 pt-3">
                  <p className="text-[10px] font-bold text-blue-800 uppercase mb-2">Clique no nome para filtrar:</p>
                  <ul className="text-sm text-blue-900 space-y-1 max-h-64 overflow-y-auto pr-1">
                    {relatorioQualitativo.participantes.map((p) => (
                      <li key={p.id}>
                        <button
                          onClick={() => setFiltroUsuario(p.id)}
                          className={`flex items-center gap-2 w-full text-left p-2 rounded-md transition-all ${
                            String(filtroUsuario) === String(p.id) 
                            ? 'bg-blue-800 text-white shadow-md' 
                            : 'hover:bg-blue-200 bg-white/50'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            String(filtroUsuario) === String(p.id) ? 'bg-white' : 'bg-blue-400'
                          }`}></span>
                          <span className="truncate text-xs font-medium">{p.nome}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="border-t border-blue-200 pt-3">
                  <p className="text-xs text-gray-500 italic">
                    Nenhum participante encontrado para este filtro.
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Verifique se as respostas têm IDs de usuário válidos.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* COLUNA DIREITA: RESPOSTAS */}
          <div className="lg:col-span-2 space-y-4">
            {relatorioQualitativo.questoes.map((q, idx) => (
              <div key={q.id} className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                <h4 className="font-bold text-gray-800 mb-3 flex gap-2 items-start">
                  <span className="bg-blue-900 text-white px-2 py-0.5 rounded text-xs mt-1">{idx + 1}</span>
                  <span className="flex-1">{q.enunciado}</span>
                </h4>

                {q.respostas.length === 0 ? (
                  <p className="text-gray-400 italic text-sm">Nenhuma resposta encontrada para este critério.</p>
                ) : (
                  <div className="space-y-2">
                    {/* Filtro inteligente para tags de nomes */}
                    {q.enunciado.toLowerCase().match(/cite|quais|quem/) ? (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {q.respostas
                          .flatMap(r => r.split(/[,;\n]/)) 
                          .map(n => n.trim())
                          .filter(n => n.length > 2)
                          .map((nome, i) => (
                            <span key={i} className="bg-yellow-50 text-yellow-800 px-3 py-1 rounded-full text-xs border border-yellow-200 font-semibold shadow-sm">
                              👤 {nome}
                            </span>
                          ))}
                      </div>
                    ) : (
                      <div className="space-y-2 pt-1">
                        {q.respostas.map((resp, i) => (
                          <div key={i} className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border-l-4 border-blue-400 leading-relaxed">
                            {resp}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            <button
              onClick={gerarPDF}
              className="w-full bg-green-800 text-white px-6 py-4 rounded-xl hover:bg-green-900 transition-all font-bold shadow-lg no-print flex items-center justify-center gap-2 mt-6"
            >
              <span>📄</span> Gerar Relatório Consolidado (PDF)
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-32 bg-white border-2 border-dashed border-gray-200 rounded-2xl">
          <div className="text-5xl mb-4">📊</div>
          <p className="text-xl text-gray-400 font-medium">Selecione uma Turma e um Questionário para começar.</p>
        </div>
      )}
    </div>
  );
}