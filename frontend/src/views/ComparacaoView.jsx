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
    if (!resposta) return null;
    
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

  // --- FUNÇÃO PARA AGRUPAR RESPOSTAS SIMILARES ---
  const agruparRespostasSimilares = (respostasComUsuarios) => {
    const agrupadas = {};
    
    respostasComUsuarios.forEach(item => {
      const textoNormalizado = item.texto.trim().toLowerCase();
      
      if (!agrupadas[textoNormalizado]) {
        agrupadas[textoNormalizado] = {
          texto: item.texto,
          usuarios: new Set()
        };
      }
      
      // Adiciona o usuário ao conjunto (Set evita duplicatas)
      agrupadas[textoNormalizado].usuarios.add(item.usuarioId);
    });
    
    // Converte Set para array e obtém nomes dos usuários
    return Object.values(agrupadas).map(grupo => ({
      texto: grupo.texto,
      usuariosIds: Array.from(grupo.usuarios),
      usuariosNomes: Array.from(grupo.usuarios).map(encontrarNomeUsuario)
    }));
  };

  // --- FUNÇÃO PARA AGRUPAR NOMES CITADOS ---
  const agruparNomesCitados = (respostasComUsuarios) => {
    const nomesAgrupados = {};
    
    respostasComUsuarios.forEach(item => {
      const nomes = item.texto.split(/[,;\n]/).map(n => n.trim()).filter(n => n.length > 2);
      
      nomes.forEach(nome => {
        if (!nomesAgrupados[nome]) {
          nomesAgrupados[nome] = {
            nome: nome,
            usuarios: new Set()
          };
        }
        
        nomesAgrupados[nome].usuarios.add(item.usuarioId);
      });
    });
    
    // Converte Set para array e obtém nomes dos usuários
    return Object.values(nomesAgrupados).map(grupo => ({
      nome: grupo.nome,
      usuariosIds: Array.from(grupo.usuarios),
      usuariosNomes: Array.from(grupo.usuarios).map(encontrarNomeUsuario)
    }));
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

    const participantesMap = {};
    
    respostasBase.forEach(resp => {
      const usuarioId = extrairUsuarioId(resp);
      
      if (!usuarioId) return;

      if (!participantesMap[usuarioId]) {
        const nomeUsuario = encontrarNomeUsuario(usuarioId);
        participantesMap[usuarioId] = { 
            id: usuarioId, 
            nome: nomeUsuario
        };
      }
    });
    
    const listaParticipantes = Object.values(participantesMap);
    
    // Filtra respostas por usuário se necessário
    const respostasFiltradas = filtroUsuario 
      ? respostasBase.filter(r => {
          const respUsuarioId = extrairUsuarioId(r);
          return respUsuarioId && String(respUsuarioId) === String(filtroUsuario);
        })
      : respostasBase;

    // Processa as questões
    const consolidado = modelo.perguntas.map(pergunta => {
      // Coleta todas as respostas para esta pergunta (já filtradas por usuário se aplicável)
      const respostasComUsuarios = respostasFiltradas
        .map(r => {
          const textoResposta = r.respostas ? r.respostas[pergunta.id] : null;
          if (!textoResposta) return null;
          
          const usuarioId = extrairUsuarioId(r);
          return {
            texto: textoResposta,
            usuarioId: usuarioId
          };
        })
        .filter(Boolean);

      // Verifica se é uma pergunta que pede para citar nomes
      const isPerguntaDeNomes = pergunta.enunciado.toLowerCase().match(/cite|quais|quem/);
      
      let respostasAgrupadas = [];
      
      if (isPerguntaDeNomes) {
        // Para perguntas de nomes, usa a função de agrupar nomes citados
        respostasAgrupadas = agruparNomesCitados(respostasComUsuarios);
      } else {
        // Para perguntas normais, agrupa respostas similares (funciona tanto com quanto sem filtro)
        respostasAgrupadas = agruparRespostasSimilares(respostasComUsuarios);
      }

      return {
        id: pergunta.id,
        enunciado: pergunta.enunciado,
        isPerguntaDeNomes: isPerguntaDeNomes,
        respostas: respostasAgrupadas
      };
    });

    return {
      totalGeral: respostasBase.length,
      totalFiltrado: respostasFiltradas.length,
      participantes: listaParticipantes,
      questoes: consolidado
    };

  }, [formularios, todasRespostas, usuarios, filtroForm, filtroTurma, filtroUsuario]);

  const COLORS = ['#FF8042', '#0088FE', '#00C49F'];

  if (loading) return <div className="p-10 text-center font-bold">Carregando dados do conselho...</div>;

return (
  <div className="bg-gray-100 min-h-[calc(100vh-64px)]">
    <div className="max-w-7xl mx-auto p-6 space-y-6">

      {/* CABEÇALHO PADRÃO IF */}
      <header className="bg-white rounded-xl shadow-md border p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-red-700"></div>
        <h1 className="text-2xl font-bold text-green-800">
          Relatórios do Conselho de Classe
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Consolidação qualitativa das contribuições registradas
        </p>
      </header>

      {/* FILTROS */}
      <div className="bg-white p-4 rounded-xl shadow border flex flex-wrap gap-4 items-end no-print">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-bold text-gray-700 mb-1">
            1. Escolha a Turma
          </label>
          <select
            className="w-full border p-2 rounded-lg bg-gray-50 focus:ring-2 focus:ring-green-800 outline-none"
            value={filtroTurma}
            onChange={e => setFiltroTurma(e.target.value)}
          >
            <option value="">-- Selecione --</option>
            {turmas.map(t => (
              <option key={t.id} value={t.id}>
                {t.nome} - {t.ano}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-bold text-gray-700 mb-1">
            2. Escolha o Questionário
          </label>
          <select
            className="w-full border p-2 rounded-lg bg-gray-50 focus:ring-2 focus:ring-green-800 outline-none"
            value={filtroForm}
            onChange={e => setFiltroForm(e.target.value)}
          >
            <option value="">-- Selecione --</option>
            {formularios.map(f => (
              <option key={f.id} value={f.id}>
                {f.titulo}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* CONTEÚDO DO CONSELHO (CARD APARECE AQUI) */}
      {filtroTurma && filtroForm && relatorioQualitativo ? (
        <div
          ref={relatorioRef}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-white p-4 rounded-xl shadow-sm border"
        >

          {/* COLUNA ESQUERDA */}
          <div className="space-y-6">

            <div className="bg-white p-5 rounded-lg shadow border-l-4 border-green-800">
              <h3 className="font-bold text-lg mb-2 text-green-800">
                Visão da Turma
              </h3>

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
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        <Cell fill="#c62828" />
                        <Cell fill="#f9a825" />
                        <Cell fill="#2e7d32" />
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* PARTICIPAÇÃO */}
            <div className="bg-green-50 p-5 rounded-lg border border-green-200 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-green-900">Participação</h3>

                {filtroUsuario && (
                  <button
                    onClick={() => setFiltroUsuario(null)}
                    className="text-[10px] bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 font-bold transition no-print"
                  >
                    LIMPAR FILTRO
                  </button>
                )}
              </div>

              <p className="text-3xl font-bold text-green-900">
                {relatorioQualitativo.totalFiltrado}
              </p>

              <p className="text-xs text-green-700 mb-4 italic">
                {filtroUsuario
                  ? "Exibindo apenas um respondente"
                  : `Total de ${relatorioQualitativo.totalGeral} respostas enviadas`}
              </p>

              <div className="border-t border-green-200 pt-3">
                <p className="text-[10px] font-bold text-green-800 uppercase mb-2">
                  Clique no nome para filtrar:
                </p>

                <ul className="text-sm text-green-900 space-y-1 max-h-64 overflow-y-auto pr-1">
                  {relatorioQualitativo.participantes.map((p) => (
                    <li key={p.id}>
                      <button
                        onClick={() => setFiltroUsuario(p.id)}
                        className={`flex items-center gap-2 w-full text-left p-2 rounded-md transition-all ${
                          String(filtroUsuario) === String(p.id)
                            ? 'bg-green-800 text-white shadow-md'
                            : 'hover:bg-green-200 bg-white/60'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${
                          String(filtroUsuario) === String(p.id)
                            ? 'bg-white'
                            : 'bg-green-500'
                        }`}></span>
                        <span className="truncate text-xs font-medium">
                          {p.nome}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA – QUESTÕES */}
          <div className="lg:col-span-2 space-y-4">
            {relatorioQualitativo.questoes.map((q, idx) => (
              <div
                key={q.id}
                className="bg-white p-5 rounded-lg shadow-sm border border-gray-100"
              >
                <h4 className="font-bold text-gray-800 mb-3 flex gap-2 items-start">
                  <span className="bg-green-800 text-white px-2 py-0.5 rounded text-xs mt-1">
                    {idx + 1}
                  </span>
                  <span className="flex-1">{q.enunciado}</span>
                </h4>

                {q.respostas.length === 0 ? (
                  <p className="text-gray-400 italic text-sm">
                    Nenhuma resposta encontrada.
                  </p>
                ) : (
                  <div className="space-y-3 pt-1">
                    {q.respostas.map((resp, i) => (
                      <div key={i} className="relative group">
                        <div className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg border-l-4 border-green-600 hover:bg-green-50 transition-all">
                          {resp.texto}
                        </div>

                        {/* BALÃO FLUTUANTE MANTIDO */}
                        <div className="absolute bottom-full left-4 mb-2 px-4 py-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 min-w-[250px]">
                          <p className="font-bold text-green-300 mb-2">
                            Respondentes:
                          </p>
                          {resp.usuariosNomes.map((nome, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                              <span>{nome}</span>
                            </div>
                          ))}
                          <div className="absolute top-full left-8 transform -translate-x-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <button
              onClick={gerarPDF}
              className="w-full bg-green-800 text-white px-6 py-4 rounded-xl hover:bg-green-900 transition-all font-bold shadow-lg no-print mt-6"
            >
              Gerar Relatório Consolidado (PDF)
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-32 bg-white border-2 border-dashed border-gray-200 rounded-2xl">
          <p className="text-xl text-gray-400 font-medium">
            Selecione uma Turma e um Questionário para começar.
          </p>
        </div>
      )}
    </div>
  </div>
);

}