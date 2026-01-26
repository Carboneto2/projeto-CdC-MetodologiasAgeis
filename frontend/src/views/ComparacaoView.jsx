import React, { useState, useEffect, useMemo, useRef } from 'react'; // Adicionei useRef aqui se não estiver
import { useTurmas } from "../hooks/useTurmas";
import { useAlunos } from "../hooks/useAlunos";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function ComparacaoView() {
  const { turmas } = useTurmas();
  const { alunos } = useAlunos();

  // Estados dos Dados
  const [formularios, setFormularios] = useState([]); 
  const [todasRespostas, setTodasRespostas] = useState([]); 
  const [usuarios, setUsuarios] = useState([]); // <--- CORRIGIDO: useState (era userState)

  // Filtros
  const [filtroTurma, setFiltroTurma] = useState("");
  const [filtroForm, setFiltroForm] = useState("");

  //pdf
  const relatorioRef = useRef(null);

  // --- 1. CARREGAR DADOS DO BACKEND ---
  useEffect(() => {
    // Busca Modelos
    fetch('http://localhost:5000/formularios')
        .then(res => res.json())
        .then(data => setFormularios(data));

    // Busca Respostas
    fetch('http://localhost:5000/respostas')
        .then(res => res.json())
        .then(data => setTodasRespostas(data));

    // Busca Usuários (para pegar os nomes)
    fetch('http://localhost:5000/usuarios')
        .then(res => res.json())
        .then(data => setUsuarios(data))
        .catch(err => console.error("Erro ao carregar usuários:", err));
    
  }, []);

  // Função para gerar PDF (mantida igual)
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

  // --- 2. PROCESSAMENTO DOS DADOS ---
  
  // A. Estatísticas da Turma
  const statsTurma = useMemo(() => {
      if (!filtroTurma) return null;
      const alunosDaTurma = alunos.filter(a => String(a.turmaId) === String(filtroTurma));
      const total = alunosDaTurma.length;
      if (total === 0) return null;

      return {
          total,
          emRisco: Math.floor(total * 0.2),
          bons: Math.floor(total * 0.5),
          excelentes: Math.floor(total * 0.3)
      };
  }, [alunos, filtroTurma]);

  // B. Consolidação das Respostas
  const relatorioQualitativo = useMemo(() => {
      if (!filtroForm || !filtroTurma) return null;

      const modelo = formularios.find(f => String(f.id) === String(filtroForm));
      if (!modelo) return null;

      // 1. Filtra respostas APENAS desta turma e formulário
      const respostasFiltradas = todasRespostas.filter(r => 
          String(r.formulario_id) === String(filtroForm) && 
          String(r.turma_id) === String(filtroTurma)
      );

      // 2. Extrai os nomes CORRETAMENTE
      // Mapeamos as respostas filtradas e procuramos o usuário dono daquela resposta
      const listaDeNomes = respostasFiltradas.map(resposta => {
          // Tenta achar o usuário pelo ID salvo na resposta (ajuste 'usuario_id' conforme seu banco)
          const usuarioEncontrado = usuarios.find(u => String(u.id) === String(resposta.usuario_id));
          
          // Se achar o usuário, retorna o nome dele. Se não, tenta pegar direto da resposta ou retorna 'Anônimo'
          return usuarioEncontrado ? usuarioEncontrado.nome : (resposta.autor || "Não identificado");
      });

      // Remove duplicatas (caso a mesma pessoa tenha respondido 2x, opcional)
      const nomesUnicos = [...new Set(listaDeNomes)];

      // 3. Agrupa as respostas por pergunta
      const consolidado = modelo.perguntas.map(pergunta => {
          const respostasDestaPergunta = respostasFiltradas.map(r => r.respostas[pergunta.id]).filter(Boolean);
          
          return {
              id: pergunta.id,
              enunciado: pergunta.enunciado,
              tipo: pergunta.tipo,
              respostas: respostasDestaPergunta
          };
      });

      return {
          totalParticipantes: respostasFiltradas.length,
          nomesParticipantes: nomesUnicos, // Usando a lista filtrada
          questoes: consolidado
      };

  }, [formularios, todasRespostas, usuarios, filtroForm, filtroTurma]); // Adicionei usuarios na dependência

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Relatórios do Conselho</h2>
          <div className="text-sm text-gray-500">
              Respostas no Banco: <span className="font-bold text-black">{todasRespostas.length}</span>
          </div>
      </div>

      {/* --- BARRA DE FILTROS --- */}
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

      {/* --- CONTEÚDO DO RELATÓRIO --- */}
      {filtroTurma && filtroForm && relatorioQualitativo ? (
            <div ref={relatorioRef} className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-white p-4"> 
              
              {/* COLUNA ESQUERDA */}
              <div className="space-y-6">
                  <div className="bg-white p-5 rounded-lg shadow border-l-4 border-blue-900">
                      <h3 className="font-bold text-lg mb-2">Visão da Turma</h3>
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
                                            isAnimationActive={false} // Importante para PDF
                                            data={[
                                                {name: 'Em Risco', value: statsTurma.emRisco},
                                                {name: 'Regulares', value: statsTurma.bons},
                                                {name: 'Excelentes', value: statsTurma.excelentes},
                                            ]}
                                            cx="50%" cy="50%" innerRadius={40} outerRadius={70} fill="#8884d8" paddingAngle={5} dataKey="value"
                                        >
                                            <Cell fill="#FF8042" />
                                            <Cell fill="#0088FE" />
                                            <Cell fill="#00C49F" />
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36}/>
                                    </PieChart>
                                </ResponsiveContainer>
                              </div>
                          </div>
                      )}
                  </div>

                  <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
                      <h3 className="font-bold text-blue-900 mb-1">Participação</h3>
                      <p className="text-3xl font-bold">{relatorioQualitativo.totalParticipantes}</p>
                      <p className="text-sm text-blue-700 mb-4">Respostas enviadas.</p>
                      
                      {/* LISTA DE NOMES AQUI */}
                      <div className="border-t border-blue-200 pt-3">
                            <p className="text-xs font-bold text-blue-800 uppercase mb-2">Respondentes:</p>
                            
                            {relatorioQualitativo.nomesParticipantes.length > 0 ? (
                                <ul className="text-sm text-blue-900 space-y-1 max-h-60 overflow-y-auto custom-scrollbar">
                                    {relatorioQualitativo.nomesParticipantes.map((nome, index) => (
                                        <li key={index} className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0"></span>
                                            <span>{nome}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <span className="text-xs text-blue-400 italic">Nenhum nome registrado</span>
                            )}
                        </div>
                  </div>
              </div>

              {/* COLUNA DIREITA */}
              <div className="lg:col-span-2 space-y-4">
                  {relatorioQualitativo.questoes.map((q, idx) => (
                      <div key={q.id} className="bg-white p-5 rounded-lg shadow-sm border hover:border-blue-300 transition">
                          <h4 className="font-bold text-gray-800 mb-3 flex gap-2">
                              <span className="bg-gray-200 text-gray-600 px-2 rounded text-sm flex items-center">{idx + 1}</span>
                              {q.enunciado}
                          </h4>

                          {q.respostas.length === 0 ? (
                              <p className="text-gray-400 italic text-sm">Sem respostas para esta questão.</p>
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
                                              <li key={i} className="text-gray-700 text-sm bg-gray-50 p-2 rounded">
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
                    disabled={!filtroTurma || !filtroForm}
                    className="bg-green-900 text-white px-4 py-2 rounded hover:bg-red-800 transition disabled:opacity-50 no-print"
                    >
                    📄 Gerar PDF
                    </button>
              </div>
          </div>
      ) : (
          <div className="text-center py-20 bg-gray-50 border-2 border-dashed rounded-xl">
              <p className="text-xl text-gray-400 font-medium">Selecione uma Turma e um Questionário acima.</p>
          </div>
      )}
    </div>
  );
}