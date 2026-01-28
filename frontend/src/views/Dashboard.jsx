import React, { useState, useEffect, useMemo } from "react";
import { useTurmas } from "../hooks/useTurmas";
import { useAlunos } from "../hooks/useAlunos";
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

// Função para normalizar nomes (remover acentos, espaços extras, converter para minúsculas)
const normalizarNome = (nome) => {
  if (!nome) return '';
  return nome
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .toLowerCase()
    .trim();
};

// Função para extrair nomes de uma string
const extrairNomesDoTexto = (texto) => {
  if (!texto || typeof texto !== 'string') return [];
  
  // Remove caracteres especiais e números, mantendo letras, espaços e vírgulas
  const textoLimpo = texto.replace(/[^a-zA-ZÀ-ÿ,\s]/g, '');
  
  // Divide por vírgulas, ponto e vírgula, " e ", " e/ou "
  const partes = textoLimpo.split(/[,;]|\be\b|\be\/ou\b/);
  
  return partes
    .map(parte => parte.trim())
    .filter(parte => parte.length >= 3 && parte.length <= 50) // Filtra por tamanho razoável
    .filter(parte => {
      // Filtra palavras comuns que não são nomes
      const palavrasComuns = [
        'sim', 'nao', 'não', 'ok', 'bom', 'ruim', 'regular', 'otimo', 'pessimo',
        'excelente', 'horrivel', 'normal', 'comum', 'diferente', 'igual',
        'tanto', 'quanto', 'outros', 'outras', 'alguns', 'algumas',
        'certo', 'errado', 'verdadeiro', 'falso', 'meio', 'meia',
        'talvez', 'provavelmente', 'possivelmente', 'geralmente',
        'especificamente', 'principalmente', 'basicamente', 'totalmente',
        'parcialmente', 'quase', 'apenas', 'so', 'somente', 'exatamente',
        'justamente', 'precisamente', 'certamente', 'claro', 'obvio', 'evidente',
        'conversas', 'faltas', 'desinteresse', 'conversa', 'falta', 'interesse',
        'atencao', 'participacao', 'participativo', 'participativa',
        'comportamento', 'comportado', 'comportada', 'disciplina',
        'disciplinado', 'disciplinada', 'educado', 'educada', 'respeito',
        'respeitoso', 'respeitosa', 'cortes', 'gentil', 'amigavel', 'hostil',
        'agressivo', 'agressiva', 'calmo', 'calma', 'agitado', 'agitada',
        'silencioso', 'silenciosa', 'barulhento', 'barulhenta', 'organizado',
        'organizada', 'desorganizado', 'desorganizada', 'responsavel',
        'irresponsavel', 'comprometido', 'comprometida', 'nenhum', 'nenhuma',
        'todas', 'todos', 'sempre', 'nunca', 'as vezes', 'raramente', 
        'frequentemente', 'muito', 'pouco', 'mais', 'menos', 'nao sei',
        'nao sei dizer', 'nao respondo', 'prefiro nao responder',
        'nao quis responder', 'nao quis', 'nao quis dizer', 'nao quis falar',
        'nao quis comentar', 'nao quis opinar'
      ];
      return !palavrasComuns.includes(normalizarNome(parte));
    });
};

export default function Dashboard() {
  const { turmas } = useTurmas();
  const { alunos: todosAlunos } = useAlunos(); // Alunos de todas as turmas
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

  // Filtrar alunos - se tiver turma selecionada, mostra só da turma, senão mostra todos
  const alunosDaTurma = useMemo(() => {
    if (filtroTurma) {
      return todosAlunos.filter(aluno => 
        String(aluno.turmaId) === String(filtroTurma)
      );
    } else {
      // Se não tem turma selecionada, mostra todos os alunos
      return todosAlunos;
    }
  }, [todosAlunos, filtroTurma]);

  // Criar mapa de alunos para busca rápida
  const mapaAlunos = useMemo(() => {
    const mapa = {};
    alunosDaTurma.forEach(aluno => {
      if (aluno.nome) {
        const nomeNormalizado = normalizarNome(aluno.nome);
        mapa[nomeNormalizado] = {
          id: aluno.id,
          nome: aluno.nome,
          nomeNormalizado,
          turmaId: aluno.turmaId,
        };
        
        // Também adiciona variações do nome (primeiro nome, sobrenome)
        const partesNome = aluno.nome.split(' ');
        if (partesNome.length > 1) {
          const primeiroNome = partesNome[0];
          const primeiroNomeNormalizado = normalizarNome(primeiroNome);
          if (!mapa[primeiroNomeNormalizado]) {
            mapa[primeiroNomeNormalizado] = {
              id: aluno.id,
              nome: aluno.nome,
              nomeNormalizado: primeiroNomeNormalizado,
              turmaId: aluno.turmaId,
            };
          }
          
          // Último nome (sobrenome)
          const ultimoNome = partesNome[partesNome.length - 1];
          const ultimoNomeNormalizado = normalizarNome(ultimoNome);
          if (ultimoNome.length >= 3 && !mapa[ultimoNomeNormalizado]) {
            mapa[ultimoNomeNormalizado] = {
              id: aluno.id,
              nome: aluno.nome,
              nomeNormalizado: ultimoNomeNormalizado,
              turmaId: aluno.turmaId,
            };
          }
        }
      }
    });
    return mapa;
  }, [alunosDaTurma]);

  // Busca perguntas do formulário selecionado
  const perguntasDoFiltro = useMemo(() => {
    const form = formularios.find((f) => String(f.id) === String(filtroForm));
    return form ? form.perguntas : [];
  }, [filtroForm, formularios]);

  // Lógica de processamento usando alunos
  const dadosGraficos = useMemo(() => {
    // Filtrar respostas baseadas nos filtros
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
      const respObj = item.respostas || {};
      
      const processarResposta = (valor) => {
        if (!valor || typeof valor !== 'string') return;
        
        // Extrai todos os nomes do texto
        const nomesExtraidos = extrairNomesDoTexto(valor);
        
        // Para cada nome extraído, verifica se corresponde a um aluno
        nomesExtraidos.forEach(nomeExtraido => {
          const nomeNormalizado = normalizarNome(nomeExtraido);
          
          // Tenta encontrar o aluno no mapa
          let alunoEncontrado = mapaAlunos[nomeNormalizado];
          
          // Se não encontrou, tenta match parcial
          if (!alunoEncontrado) {
            // Procura por match parcial (nome contém ou é contido)
            const chavesMapa = Object.keys(mapaAlunos);
            for (const chave of chavesMapa) {
              if (nomeNormalizado.includes(chave) || chave.includes(nomeNormalizado)) {
                alunoEncontrado = mapaAlunos[chave];
                break;
              }
            }
          }
          
          // Se encontrou um aluno, conta a menção
          if (alunoEncontrado) {
            const nomeAluno = alunoEncontrado.nome;
            contagemAlunos[nomeAluno] = (contagemAlunos[nomeAluno] || 0) + 1;
          }
        });
      };

      if (filtroPergunta) {
        // Filtro específico por pergunta
        const valor = respObj[filtroPergunta];
        processarResposta(valor);
      } else {
        // Geral do formulário - processa todas as respostas
        Object.values(respObj).forEach((valor) => {
          processarResposta(valor);
        });
      }
    });

    // Converte para array e formata para os gráficos
    const formatados = Object.entries(contagemAlunos)
      .map(([name, value]) => ({ 
        name, 
        value,
        displayName: name.length > 15 ? `${name.substring(0, 12)}...` : name
      }))
      .sort((a, b) => b.value - a.value);

    return {
      pizza: formatados.slice(0, 7),
      barras: formatados.slice(0, 15), // Limita a 15 itens para melhor visualização
    };
  }, [respostas, filtroTurma, filtroForm, filtroPergunta, mapaAlunos]);

  // Função para obter o texto da turma selecionada
  const getTurmaSelecionadaText = () => {
    if (filtroTurma) {
      const turma = turmas.find(t => String(t.id) === String(filtroTurma));
      return turma ? turma.nome : 'Turma Selecionada';
    }
    return 'Todas as Turmas';
  };

  // Função para obter o título da seção de alunos
  const getTituloAlunos = () => {
    if (filtroTurma) {
      return `Alunos da Turma (${alunosDaTurma.length})`;
    }
    return `Todos os Alunos (${alunosDaTurma.length})`;
  };

  return (
    <div className="bg-gray-100 min-h-[calc(100vh-64px)]">
      {/* CONTAINER CENTRAL */}
      <div className="max-w-7xl mx-auto p-6 space-y-6">

        {/* TÍTULO */}
        <header className="bg-white rounded-xl shadow-md border p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-red-700"></div>
          <h1 className="text-2xl font-bold text-green-800">
            Dashboard Analítico
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Análise de menções aos alunos nas respostas dos formulários
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
              <p className="text-xs text-gray-500 mt-1">
                {filtroTurma 
                  ? `${alunosDaTurma.length} alunos nesta turma`
                  : `${alunosDaTurma.length} alunos em todas as turmas`}
              </p>
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
                Pergunta Específica
              </label>
              <select
                className={`w-full border p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-700
                  ${!filtroForm
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
                    {p.enunciado.length > 40 
                      ? `${p.enunciado.substring(0, 37)}...` 
                      : p.enunciado}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* INFO SOBRE O FILTRO */}
          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-xs text-green-700">
              <strong>Como funciona:</strong> O sistema compara os nomes citados nas respostas 
              com a lista de alunos {filtroTurma ? 'da turma selecionada' : 'de todas as turmas'}.
              <span className="block mt-1 font-medium">
                Filtro atual: {getTurmaSelecionadaText()} • {filtroForm 
                  ? formularios.find(f => String(f.id) === String(filtroForm))?.titulo 
                  : 'Todos os formulários'}
              </span>
            </p>
          </div>
        </section>

        {/* GRÁFICOS */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* GRÁFICO PIZZA */}
          <div className="bg-white rounded-xl shadow-md border p-6 h-[450px] overflow-hidden">
            <h2 className="text-lg font-bold text-green-800 mb-4">
              Top 7 Alunos Mais Citados
              <span className="text-sm font-normal text-gray-600 ml-2">
                ({getTurmaSelecionadaText()})
              </span>
            </h2>

            <div className="h-[360px]">
              {dadosGraficos.pizza.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dadosGraficos.pizza}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={2}
                      label={(entry) => entry.displayName}
                      labelLine={true}
                    >
                      {dadosGraficos.pizza.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name, props) => [value, props.payload.name]}
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #1b5e20",
                        borderRadius: "8px",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                        fontSize: "0.85rem",
                        maxWidth: "300px",
                      }}
                      labelStyle={{
                        color: "#1b5e20",
                        fontWeight: 700,
                        marginBottom: "4px",
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                      }}
                    />
                    <Legend
                      layout="vertical"
                      verticalAlign="middle"
                      align="right"
                      formatter={(value) => value.length > 12 ? `${value.substring(0, 10)}...` : value}
                      wrapperStyle={{
                        paddingLeft: "20px",
                        fontSize: "11px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p className="text-center">
                    {filtroForm 
                      ? "Nenhum aluno identificado nas respostas com os filtros atuais." 
                      : "Selecione um formulário para visualizar os dados."}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* GRÁFICO BARRAS */}
          <div className="bg-white rounded-xl shadow-md border p-6 h-[450px] overflow-hidden">
            <h2 className="text-lg font-bold text-green-800 mb-4">
              Volume de Menções (Top 15)
              <span className="text-sm font-normal text-gray-600 ml-2">
                ({getTurmaSelecionadaText()})
              </span>
            </h2>

            <div className="h-[360px]">
              {dadosGraficos.barras.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dadosGraficos.barras}
                    layout="vertical"
                    margin={{ top: 10, right: 30, left: 100, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} />
                    <XAxis 
                      type="number" 
                      allowDecimals={false}
                      label={{ value: 'Número de Menções', position: 'insideBottom', offset: -10 }}
                    />
                    <YAxis 
                      dataKey="name"
                      type="category"
                      width={95}
                      tick={{ fontSize: 11 }}
                      tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 13)}...` : value}
                    />
                    <Tooltip
                      formatter={(value) => [`${value} menções`, 'Quantidade']}
                      labelFormatter={(label) => `Aluno: ${label}`}
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #1b5e20",
                        borderRadius: "8px",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                        fontSize: "0.85rem",
                        maxWidth: "300px",
                        whiteSpace: "normal",
                      }}
                    />
                    <Bar
                      dataKey="value"
                      fill="#1b5e20"
                      radius={[0, 6, 6, 0]}
                      barSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-center">
                    {filtroForm 
                      ? "Nenhum aluno identificado nas respostas com os filtros atuais." 
                      : "Selecione um formulário para visualizar os dados."}
                  </p>
                </div>
              )}
            </div>
          </div>

        </section>

        {/* ESTATÍSTICAS */}
        <section className="bg-white rounded-xl shadow-md border p-6">
          <h2 className="text-lg font-bold text-green-800 mb-4">
            Resumo Estatístico
            <span className="text-sm font-normal text-gray-600 ml-2">
              ({getTurmaSelecionadaText()})
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700 font-semibold">Total de Respostas</p>
              <p className="text-2xl font-bold text-blue-900">{respostas.filter(r => {
                const matchTurma = filtroTurma ? String(r.turma_id) === String(filtroTurma) : true;
                const matchForm = filtroForm ? String(r.formulario_id) === String(filtroForm) : true;
                return matchTurma && matchForm;
              }).length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-green-700 font-semibold">
                {filtroTurma ? 'Alunos da Turma' : 'Total de Alunos'}
              </p>
              <p className="text-2xl font-bold text-green-900">{alunosDaTurma.length}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-700 font-semibold">Alunos Citados</p>
              <p className="text-2xl font-bold text-yellow-900">
                {dadosGraficos.barras.length}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <p className="text-sm text-purple-700 font-semibold">Total de Menções</p>
              <p className="text-2xl font-bold text-purple-900">
                {dadosGraficos.barras.reduce((total, item) => total + item.value, 0)}
              </p>
            </div>
          </div>
          
          {/* LISTA DE ALUNOS */}
          {alunosDaTurma.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
              <h3 className="text-sm font-bold text-gray-700 mb-3">
                {getTituloAlunos()}
                <span className="ml-2 text-xs font-normal text-gray-500">
                  {filtroTurma 
                    ? `(Turma ${turmas.find(t => String(t.id) === String(filtroTurma))?.nome || filtroTurma})`
                    : '(Todas as turmas)'}
                </span>
              </h3>
              <div className="max-h-60 overflow-y-auto pr-2">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {alunosDaTurma.map(aluno => {
                    const mencoes = dadosGraficos.barras.find(a => a.name === aluno.nome)?.value || 0;
                    const turmaAluno = turmas.find(t => String(t.id) === String(aluno.turmaId));
                    return (
                      <div 
                        key={aluno.id} 
                        className={`p-3 rounded border text-xs ${
                          mencoes > 0 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-gray-100 border-gray-200'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium truncate">{aluno.nome}</span>
                          {mencoes > 0 && (
                            <span className="bg-green-600 text-white px-1.5 py-0.5 rounded-full text-xs font-bold min-w-[20px] text-center">
                              {mencoes}
                            </span>
                          )}
                        </div>
                        {!filtroTurma && turmaAluno && (
                          <div className="text-xs text-gray-500 mt-1 truncate">
                            {turmaAluno.nome}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* RESUMO DE TURMAS (só aparece quando mostrando todos os alunos) */}
              {!filtroTurma && turmas.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-xs font-bold text-gray-600 mb-2">Distribuição por Turma:</h4>
                  <div className="flex flex-wrap gap-2">
                    {turmas.map(turma => {
                      const alunosNaTurma = todosAlunos.filter(a => String(a.turmaId) === String(turma.id)).length;
                      const alunosCitadosNaTurma = dadosGraficos.barras.filter(item => {
                        const aluno = todosAlunos.find(a => a.nome === item.name);
                        return aluno && String(aluno.turmaId) === String(turma.id);
                      }).length;
                      
                      return (
                        <div key={turma.id} className="flex items-center gap-1 bg-white px-2 py-1 rounded border text-xs">
                          <span className="font-medium">{turma.nome}:</span>
                          <span className="text-gray-600">
                            {alunosCitadosNaTurma}/{alunosNaTurma} alunos citados
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}