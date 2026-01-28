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
        if (resUsuarios.ok) {
          const usuariosData = await resUsuarios.json();
          console.log("Usuários carregados:", usuariosData);
          setUsuarios(usuariosData);
        }
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

  // --- FUNÇÃO PARA GERAR PDF PROFISSIONAL ---
  const gerarPDFProfissional = async () => {
    if (!relatorioQualitativo) return;

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = margin;

    // --- CABEÇALHO DO PDF ---
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(46, 125, 50); // Verde IF
    pdf.text("Relatório de Conselho de Classe", pageWidth / 2, yPosition, { align: "center" });
    
    yPosition += 10;
    
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(0, 0, 0);
    
    const turmaSelecionada = turmas.find(t => String(t.id) === String(filtroTurma));
    const formularioSelecionado = formularios.find(f => String(f.id) === String(filtroForm));
    const usuarioSelecionado = filtroUsuario ? 
      relatorioQualitativo.participantes.find(p => String(p.id) === String(filtroUsuario)) : 
      null;
    
    // Informações do relatório
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    
    pdf.text(`Turma: ${turmaSelecionada ? `${turmaSelecionada.nome} - ${turmaSelecionada.ano}` : 'Não informada'}`, margin, yPosition);
    yPosition += 7;
    
    pdf.text(`Formulário: ${formularioSelecionado?.titulo || 'Não informado'}`, margin, yPosition);
    yPosition += 7;
    
    if (usuarioSelecionado) {
      pdf.text(`Respondente: ${usuarioSelecionado.nome} (${usuarioSelecionado.perfil})`, margin, yPosition);
      yPosition += 7;
    } else {
      pdf.text(`Total de respondentes: ${relatorioQualitativo.participantes.length}`, margin, yPosition);
      yPosition += 7;
    }
    
    pdf.text(`Data do relatório: ${dataAtual}`, margin, yPosition);
    yPosition += 15;
    
    // Linha divisória
    pdf.setDrawColor(46, 125, 50);
    pdf.setLineWidth(0.5);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // --- CONTEÚDO DO RELATÓRIO ---
    const questoesParaPDF = filtroUsuario 
      ? relatorioQualitativo.questoes.filter(q => q.totalRespostas > 0) // Apenas perguntas respondidas
      : relatorioQualitativo.questoes;

    // Função para adicionar nova página se necessário
    const checkNewPage = (spaceNeeded) => {
      if (yPosition + spaceNeeded > pdf.internal.pageSize.getHeight() - margin) {
        pdf.addPage();
        yPosition = margin;
        return true;
      }
      return false;
    };

    // Processar cada questão
    for (let idx = 0; idx < questoesParaPDF.length; idx++) {
      const q = questoesParaPDF[idx];
      
      // Verificar se precisa de nova página
      checkNewPage(20);
      
      // Título da questão
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(0, 0, 0);
      
      // Quebrar texto longo do enunciado
      const enunciadoLines = pdf.splitTextToSize(`${idx + 1}. ${q.enunciado}`, pageWidth - 2 * margin);
      pdf.text(enunciadoLines, margin, yPosition);
      yPosition += (enunciadoLines.length * 7) + 5;
      
      // Subtipo da questão
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "italic");
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Tipo: ${q.tipo === "multipla" ? "Múltipla Escolha" : 
               q.tipo === "lista_alunos" ? "Lista de Alunos" : 
               q.tipo === "texto" ? "Texto Curto" : "Texto Longo"}`, margin, yPosition);
      yPosition += 7;
      
      // Respostas
      if (q.respostas.length === 0) {
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(150, 150, 150);
        pdf.text("Nenhuma resposta registrada.", margin, yPosition);
        yPosition += 10;
      } else {
        // Para múltipla escolha - exibir resultados em tabela
        if (q.tipo === "multipla") {
          checkNewPage(30);
          
          // Cabeçalho da tabela
          pdf.setFontSize(11);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(0, 0, 0);
          
          pdf.text("Opção", margin, yPosition);
          pdf.text("Votos", pageWidth - margin - 20, yPosition, { align: "right" });
          yPosition += 7;
          
          // Linha da tabela
          pdf.setDrawColor(200, 200, 200);
          pdf.setLineWidth(0.2);
          pdf.line(margin, yPosition - 3, pageWidth - margin, yPosition - 3);
          yPosition += 5;
          
          // Conteúdo da tabela
          pdf.setFont("helvetica", "normal");
          q.respostas.forEach((resp, i) => {
            checkNewPage(10);
            
            pdf.text(resp.texto, margin, yPosition);
            pdf.text(`${resp.contagem}`, pageWidth - margin - 20, yPosition, { align: "right" });
            
            // Se filtrado por usuário, mostrar se ele escolheu esta opção
            if (filtroUsuario) {
              const usuarioEscolheu = resp.usuariosIds.some(id => String(id) === String(filtroUsuario));
              if (usuarioEscolheu) {
                pdf.setTextColor(46, 125, 50);
                pdf.text("✓", pageWidth - margin - 30, yPosition);
                pdf.setTextColor(0, 0, 0);
              }
            }
            
            yPosition += 7;
          });
          
          yPosition += 10;
          
        } else if (q.tipo === "lista_alunos") {
          // Para lista de alunos
          checkNewPage(30);
          
          pdf.setFontSize(11);
          pdf.setFont("helvetica", "bold");
          pdf.text("Alunos citados:", margin, yPosition);
          yPosition += 7;
          
          pdf.setFont("helvetica", "normal");
          
          const alunosPorLinha = 3;
          let alunosNaLinha = 0;
          let linhaAtualY = yPosition;
          
          q.respostas.forEach((resp, i) => {
            if (alunosNaLinha === alunosPorLinha) {
              alunosNaLinha = 0;
              linhaAtualY += 7;
              checkNewPage(10);
            }
            
            const alunoText = `${resp.nome || resp.texto} (${resp.usuariosNomes.length})`;
            const coluna = margin + (alunosNaLinha * 60);
            pdf.text(alunoText, coluna, linhaAtualY);
            alunosNaLinha++;
          });
          
          yPosition = linhaAtualY + 15;
          
        } else {
          // Para respostas textuais
          q.respostas.forEach((resp, i) => {
            checkNewPage(30);
            
            // Resposta
            pdf.setFontSize(11);
            pdf.setFont("helvetica", "normal");
            pdf.setTextColor(0, 0, 0);
            
            const respostaLines = pdf.splitTextToSize(`"${resp.texto}"`, pageWidth - 2 * margin - 10);
            pdf.text(respostaLines, margin + 5, yPosition);
            yPosition += (respostaLines.length * 6) + 5;
            
            // Respondentes (se não for filtro individual)
            if (!filtroUsuario && resp.usuariosNomes.length > 0) {
              pdf.setFontSize(9);
              pdf.setFont("helvetica", "italic");
              pdf.setTextColor(100, 100, 100);
              
              const respondentesText = `Respondido por: ${resp.usuariosNomes.slice(0, 3).join(', ')}`;
              const respondentesLines = pdf.splitTextToSize(respondentesText, pageWidth - 2 * margin - 10);
              pdf.text(respondentesLines, margin + 10, yPosition);
              yPosition += (respondentesLines.length * 5) + 5;
            }
            
            yPosition += 5;
          });
        }
      }
      
      // Espaço entre questões
      yPosition += 10;
      
      // Adicionar página se estiver no final
      if (yPosition > pdf.internal.pageSize.getHeight() - 30) {
        pdf.addPage();
        yPosition = margin;
      }
    }
    
    // --- RODAPÉ ---
    const pageCount = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(150, 150, 150);
      
      // Número da página
      pdf.text(
        `Página ${i} de ${pageCount}`,
        pageWidth / 2,
        pdf.internal.pageSize.getHeight() - 10,
        { align: "center" }
      );
      
      // Logo/Instituição
      pdf.text(
        "Instituto Federal - Sistema de Conselho de Classe",
        margin,
        pdf.internal.pageSize.getHeight() - 10
      );
    }
    
    // Salvar PDF
    const nomeArquivo = `Relatorio_Conselho_${turmaSelecionada?.nome || 'Turma'}_${dataAtual.replace(/\//g, '-')}.pdf`;
    pdf.save(nomeArquivo);
  };

  // --- FUNÇÃO AUXILIAR PARA ENCONTRAR NOME DO USUÁRIO (COMPATÍVEL COM O CADASTRO) ---
  const encontrarNomeUsuario = (usuarioId) => {
    if (!usuarioId || usuarioId === 'undefined' || usuarioId === 'null') {
      return 'Usuário Desconhecido';
    }

    console.log(`Buscando usuário com ID: ${usuarioId}`, usuarios);

    // Se o ID começar com "perfil_", é um perfil e não um ID numérico
    if (String(usuarioId).startsWith('perfil_')) {
      const perfil = String(usuarioId).replace('perfil_', '');
      // Tenta encontrar usuário pelo perfil
      const usuarioPorPerfil = usuarios.find(u => u.perfil === perfil);
      if (usuarioPorPerfil) {
        return usuarioPorPerfil.nome || `Usuário (${perfil})`;
      }
      return `Usuário (${perfil})`;
    }

    // Tenta encontrar pelo ID numérico (campo 'id' dos usuários cadastrados)
    const usuarioEncontrado = usuarios.find(u => {
      // Primeiro, tenta pelo campo 'id' (que é o campo usado no cadastro)
      if (u.id && String(u.id) === String(usuarioId)) {
        return true;
      }
      
      // Tenta converter para número se possível
      const idNumerico = Number(usuarioId);
      if (!isNaN(idNumerico)) {
        if (u.id === idNumerico) return true;
      }
      
      return false;
    });
    
    if (usuarioEncontrado) {
      console.log(`Usuário encontrado:`, usuarioEncontrado);
      // Usa o mesmo formato do cadastro: nome, login, etc.
      return usuarioEncontrado.nome || 
             usuarioEncontrado.username || 
             usuarioEncontrado.login || 
             `Usuário ${usuarioId}`;
    }
    
    // Se não encontrou, retorna o ID formatado
    return `Usuário ${usuarioId}`;
  };

  // --- FUNÇÃO AUXILIAR PARA EXTRAIR ID DO USUÁRIO ---
  const extrairUsuarioId = (resposta) => {
    if (!resposta) return null;
    
    // Verifica se há um campo específico de usuário
    if (resposta.usuario_id) {
      console.log(`Usando usuario_id: ${resposta.usuario_id}`);
      return String(resposta.usuario_id);
    }
    
    if (resposta.id_usuario) {
      console.log(`Usando id_usuario: ${resposta.id_usuario}`);
      return String(resposta.id_usuario);
    }
    
    if (resposta.idusuario) {
      console.log(`Usando idusuario: ${resposta.idusuario}`);
      return String(resposta.idusuario);
    }
    
    // Tenta campos comuns de ID
    if (resposta.id && typeof resposta.id === 'number') {
      console.log(`Usando id (numérico): ${resposta.id}`);
      return String(resposta.id);
    }
    
    // Se perfil_usuario for um número, pode ser o ID
    if (resposta.perfil_usuario && !isNaN(Number(resposta.perfil_usuario))) {
      console.log(`Usando perfil_usuario como ID (numérico): ${resposta.perfil_usuario}`);
      return String(resposta.perfil_usuario);
    }
    
    // Último recurso: se perfil_usuario for string, usa como identificador
    if (resposta.perfil_usuario) {
      console.log(`Usando perfil_usuario como string: ${resposta.perfil_usuario}`);
      return `perfil_${resposta.perfil_usuario}`;
    }
    
    console.log("Nenhum ID de usuário encontrado na resposta:", resposta);
    return null;
  };

  // --- FUNÇÃO PARA AGRUPAR RESPOSTAS SIMILARES ---
  const agruparRespostasSimilares = (respostasComUsuarios) => {
    const agrupadas = {};
    
    respostasComUsuarios.forEach(item => {
      if (!item || !item.texto) return;
      
      const textoNormalizado = item.texto.trim().toLowerCase();
      const usuarioId = item.usuarioId;
      
      if (!textoNormalizado) return;
      
      if (!agrupadas[textoNormalizado]) {
        agrupadas[textoNormalizado] = {
          texto: item.texto,
          usuarios: new Set()
        };
      }
      
      if (usuarioId) {
        agrupadas[textoNormalizado].usuarios.add(usuarioId);
      }
    });
    
    return Object.values(agrupadas)
      .map(grupo => ({
        texto: grupo.texto,
        usuariosIds: Array.from(grupo.usuarios),
        usuariosNomes: Array.from(grupo.usuarios).map(encontrarNomeUsuario)
      }))
      .filter(grupo => grupo.texto && grupo.texto.trim() !== '');
  };

  // --- FUNÇÃO PARA AGRUPAR NOMES CITADOS ---
  const agruparNomesCitados = (respostasComUsuarios) => {
    const nomesAgrupados = {};
    
    respostasComUsuarios.forEach(item => {
      if (!item || !item.texto) return;
      
      const nomes = item.texto.split(/[,;\n]/).map(n => n.trim()).filter(n => n.length > 2);
      const usuarioId = item.usuarioId;
      
      nomes.forEach(nome => {
        if (!nomesAgrupados[nome]) {
          nomesAgrupados[nome] = {
            nome: nome,
            usuarios: new Set()
          };
        }
        
        if (usuarioId) {
          nomesAgrupados[nome].usuarios.add(usuarioId);
        }
      });
    });
    
    return Object.values(nomesAgrupados).map(grupo => ({
      nome: grupo.nome,
      usuariosIds: Array.from(grupo.usuarios),
      usuariosNomes: Array.from(grupo.usuarios).map(encontrarNomeUsuario)
    }));
  };

  // --- FUNÇÃO PARA AGRUPAR MULTIPLA ESCOLHA ---
  const agruparMultiplaEscolha = (respostasComUsuarios, opcoesPergunta) => {
    const opcoesAgrupadas = {};
    
    if (opcoesPergunta && Array.isArray(opcoesPergunta)) {
      opcoesPergunta.forEach(opcao => {
        opcoesAgrupadas[opcao] = {
          texto: opcao,
          usuarios: new Set()
        };
      });
    }
    
    respostasComUsuarios.forEach(item => {
      if (!item || !item.texto) return;
      
      let respostasSelecionadas = [];
      const usuarioId = item.usuarioId;
      
      if (Array.isArray(item.texto)) {
        respostasSelecionadas = item.texto;
      } else if (typeof item.texto === 'string') {
        respostasSelecionadas = item.texto.split(',').map(r => r.trim()).filter(r => r);
      } else {
        respostasSelecionadas = [String(item.texto)];
      }
      
      respostasSelecionadas.forEach(resposta => {
        const respostaNormalizada = resposta.trim();
        
        if (!opcoesAgrupadas[respostaNormalizada]) {
          opcoesAgrupadas[respostaNormalizada] = {
            texto: respostaNormalizada,
            usuarios: new Set()
          };
        }
        
        if (usuarioId) {
          opcoesAgrupadas[respostaNormalizada].usuarios.add(usuarioId);
        }
      });
    });
    
    return Object.values(opcoesAgrupadas)
      .map(grupo => ({
        texto: grupo.texto,
        usuariosIds: Array.from(grupo.usuarios),
        usuariosNomes: Array.from(grupo.usuarios).map(encontrarNomeUsuario),
        contagem: grupo.usuarios.size
      }))
      .sort((a, b) => b.contagem - a.contagem);
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

    console.log("Respostas base encontradas:", respostasBase.length);

    const participantesMap = {};
    
    respostasBase.forEach(resp => {
      const usuarioId = extrairUsuarioId(resp);
      
      if (!usuarioId) {
        console.log("Não foi possível extrair ID do usuário da resposta:", resp);
        return;
      }

      if (!participantesMap[usuarioId]) {
        const nomeUsuario = encontrarNomeUsuario(usuarioId);
        participantesMap[usuarioId] = { 
          id: usuarioId, 
          nome: nomeUsuario,
          perfil: resp.perfil_usuario || 'Não informado'
        };
      }
    });
    
    const listaParticipantes = Object.values(participantesMap);
    console.log("Participantes mapeados:", listaParticipantes);
    
    // Filtra respostas por usuário se necessário
    const respostasFiltradas = filtroUsuario 
      ? respostasBase.filter(r => {
          const respUsuarioId = extrairUsuarioId(r);
          return respUsuarioId && String(respUsuarioId) === String(filtroUsuario);
        })
      : respostasBase;

    // Processa as questões - FILTRANDO APENAS PERGUNTAS RESPONDIDAS QUANDO HÁ FILTRO DE USUÁRIO
    const todasQuestoes = modelo.perguntas;
    const perguntasParaExibir = filtroUsuario 
      ? todasQuestoes.filter(pergunta => {
          // Verifica se há pelo menos uma resposta do usuário para esta pergunta
          return respostasFiltradas.some(r => {
            let textoResposta = null;
            
            if (r.payload && typeof r.payload === 'object') {
              textoResposta = r.payload[pergunta.id];
            } else if (r.respostas) {
              textoResposta = r.respostas[pergunta.id];
            }
            
            return textoResposta !== undefined && textoResposta !== null && textoResposta !== '';
          });
        })
      : todasQuestoes;

    const consolidado = perguntasParaExibir.map(pergunta => {
      const respostasComUsuarios = respostasFiltradas
        .map(r => {
          let textoResposta = null;
          
          if (r.payload && typeof r.payload === 'object') {
            textoResposta = r.payload[pergunta.id];
          } else if (r.respostas) {
            textoResposta = r.respostas[pergunta.id];
          }
          
          if (textoResposta === undefined || textoResposta === null || textoResposta === '') {
            return null;
          }
          
          const usuarioId = extrairUsuarioId(r);
          return {
            texto: textoResposta,
            usuarioId: usuarioId,
            usuarioNome: encontrarNomeUsuario(usuarioId),
            perfil: r.perfil_usuario
          };
        })
        .filter(Boolean);

      const isPerguntaDeNomes = pergunta.tipo === "lista_alunos" || 
        (pergunta.tipo === "texto_longo" && pergunta.enunciado.toLowerCase().match(/cite|quais|quem|aluno|estudante|discente/));
      
      let respostasAgrupadas = [];
      
      if (pergunta.tipo === "multipla") {
        respostasAgrupadas = agruparMultiplaEscolha(respostasComUsuarios, pergunta.opcoes);
      } else if (isPerguntaDeNomes) {
        respostasAgrupadas = agruparNomesCitados(respostasComUsuarios);
      } else {
        respostasAgrupadas = agruparRespostasSimilares(respostasComUsuarios);
      }

      return {
        id: pergunta.id,
        enunciado: pergunta.enunciado,
        tipo: pergunta.tipo || 'texto_longo',
        opcoes: pergunta.opcoes,
        isPerguntaDeNomes: isPerguntaDeNomes,
        respostas: respostasAgrupadas,
        totalRespostas: respostasComUsuarios.length
      };
    });

    console.log("Relatório qualitativo gerado:", {
      totalGeral: respostasBase.length,
      totalFiltrado: respostasFiltradas.length,
      participantes: listaParticipantes,
      questoes: consolidado
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

        {/* CONTEÚDO DO CONSELHO */}
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
                    ? `Exibindo apenas respostas de: ${relatorioQualitativo.participantes.find(p => String(p.id) === String(filtroUsuario))?.nome || 'Usuário'}`
                    : `Total de ${relatorioQualitativo.totalGeral} respostas enviadas`}
                </p>

                {filtroUsuario ? (
                  <div className="border-t border-green-200 pt-3">
                    <p className="text-[10px] font-bold text-green-800 uppercase mb-2">
                      Filtrando por:
                    </p>
                    <div className="bg-white p-3 rounded-md border">
                      <p className="text-sm font-medium">{relatorioQualitativo.participantes.find(p => String(p.id) === String(filtroUsuario))?.nome || 'Usuário'}</p>
                      <p className="text-xs text-gray-500">{relatorioQualitativo.participantes.find(p => String(p.id) === String(filtroUsuario))?.perfil || 'Perfil não informado'}</p>
                    </div>
                  </div>
                ) : (
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
                            <span className="text-xs text-gray-500 ml-auto">
                              {p.perfil}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* COLUNA DIREITA – QUESTÕES */}
            <div className="lg:col-span-2 space-y-4">
              {relatorioQualitativo.questoes.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500">
                    {filtroUsuario 
                      ? "Este usuário não respondeu nenhuma pergunta deste formulário."
                      : "Nenhuma resposta encontrada para este formulário e turma."}
                  </p>
                </div>
              ) : (
                <>
                  {relatorioQualitativo.questoes.map((q, idx) => (
                    <div
                      key={q.id}
                      className="bg-white p-5 rounded-lg shadow-sm border border-gray-100"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold text-gray-800 flex gap-2 items-start">
                          <span className="bg-green-800 text-white px-2 py-0.5 rounded text-xs mt-1">
                            {idx + 1}
                          </span>
                          <span className="flex-1">{q.enunciado}</span>
                        </h4>
                        <div className="flex gap-2">
                          <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                            {q.tipo === "multipla" ? "Múltipla Escolha" : 
                             q.tipo === "lista_alunos" ? "Lista de Alunos" : 
                             q.tipo === "texto" ? "Texto Curto" : "Texto Longo"}
                          </span>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {q.totalRespostas} resposta(s)
                          </span>
                        </div>
                      </div>

                      {q.respostas.length === 0 ? (
                        <p className="text-gray-400 italic text-sm">
                          {filtroUsuario 
                            ? "Este usuário não respondeu esta pergunta."
                            : "Nenhuma resposta encontrada."}
                        </p>
                      ) : (
                        <div className="space-y-3 pt-1">
                          {q.tipo === "multipla" ? (
                            <div className="space-y-4">
                              {q.respostas.map((resp, i) => {
                                const usuarioSelecionou = filtroUsuario 
                                  ? resp.usuariosIds.some(id => String(id) === String(filtroUsuario))
                                  : false;
                                
                                return (
                                  <div key={i} className="relative group">
                                    <div className={`flex items-center justify-between p-3 rounded-lg border-l-4 transition-all ${
                                      usuarioSelecionou
                                        ? 'bg-blue-100 border-blue-600'
                                        : 'bg-blue-50 border-blue-400 hover:bg-blue-100'
                                    }`}>
                                      <span className="text-sm font-medium text-gray-800">
                                        {resp.texto}
                                        {usuarioSelecionou && (
                                          <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
                                            Sua escolha
                                          </span>
                                        )}
                                      </span>
                                      <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                                        {resp.contagem} voto(s)
                                      </span>
                                    </div>
                                    
                                    {!filtroUsuario && (
                                      <div className="absolute bottom-full left-4 mb-2 px-4 py-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 min-w-[250px]">
                                        <p className="font-bold text-blue-300 mb-2">
                                          Quem escolheu esta opção:
                                        </p>
                                        {resp.usuariosNomes.length > 0 ? (
                                          resp.usuariosNomes.map((nome, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                              <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                                              <span>{nome}</span>
                                            </div>
                                          ))
                                        ) : (
                                          <p className="text-gray-400">Nenhum usuário identificado</p>
                                        )}
                                        <div className="absolute top-full left-8 transform -translate-x-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : q.tipo === "lista_alunos" ? (
                            <div className="bg-gray-50 p-4 rounded-lg border">
                              <p className="text-sm font-medium text-gray-700 mb-3">
                                Alunos citados:
                              </p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {q.respostas.map((resp, i) => {
                                  const usuarioCitou = filtroUsuario 
                                    ? resp.usuariosIds.some(id => String(id) === String(filtroUsuario))
                                    : false;
                                  
                                  return (
                                    <div key={i} className="relative group bg-white p-3 rounded border">
                                      <div className="flex justify-between items-center">
                                        <span className="font-medium">{resp.nome || resp.texto}</span>
                                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                          {resp.usuariosNomes.length} citação(ões)
                                        </span>
                                      </div>
                                      
                                      {usuarioCitou && (
                                        <div className="mt-1 text-xs text-blue-600 font-medium">
                                          ✓ Você citou este aluno
                                        </div>
                                      )}
                                      
                                      {!filtroUsuario && (
                                        <div className="absolute bottom-full left-4 mb-2 px-4 py-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 min-w-[250px]">
                                          <p className="font-bold text-green-300 mb-2">
                                            Quem citou este aluno:
                                          </p>
                                          {resp.usuariosNomes.length > 0 ? (
                                            resp.usuariosNomes.map((nome, idx) => (
                                              <div key={idx} className="flex items-center gap-2">
                                                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                                <span>{nome}</span>
                                              </div>
                                            ))
                                          ) : (
                                            <p className="text-gray-400">Nenhum usuário identificado</p>
                                          )}
                                          <div className="absolute top-full left-8 transform -translate-x-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {q.respostas.map((resp, i) => {
                                const usuarioRespondeu = filtroUsuario 
                                  ? resp.usuariosIds.some(id => String(id) === String(filtroUsuario))
                                  : false;
                                
                                return (
                                  <div key={i} className="relative group">
                                    <div className={`text-sm text-gray-700 p-4 rounded-lg border-l-4 transition-all ${
                                      usuarioRespondeu
                                        ? 'bg-green-50 border-green-600'
                                        : 'bg-gray-50 border-green-400 hover:bg-green-50'
                                    }`}>
                                      {resp.texto}
                                      {usuarioRespondeu && (
                                        <div className="mt-2 text-xs text-green-600 font-medium">
                                          ✓ Sua resposta
                                        </div>
                                      )}
                                    </div>

                                    {!filtroUsuario && (
                                      <div className="absolute bottom-full left-4 mb-2 px-4 py-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 min-w-[250px]">
                                        <p className="font-bold text-green-300 mb-2">
                                          Quem respondeu:
                                        </p>
                                        {resp.usuariosNomes.length > 0 ? (
                                          resp.usuariosNomes.map((nome, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                              <span>{nome}</span>
                                            </div>
                                          ))
                                        ) : (
                                          <p className="text-gray-400">Nenhum usuário identificado</p>
                                        )}
                                        <div className="absolute top-full left-8 transform -translate-x-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  <button
                    onClick={gerarPDFProfissional}
                    className="w-full bg-green-800 text-white px-6 py-4 rounded-xl hover:bg-green-900 transition-all font-bold shadow-lg no-print mt-6"
                  >
                    Gerar Relatório Profissional (PDF)
                  </button>
                </>
              )}
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