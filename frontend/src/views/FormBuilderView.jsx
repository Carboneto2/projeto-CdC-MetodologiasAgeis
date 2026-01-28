  import React, { useState, useEffect } from "react";
  import { generateId } from "../lib/storage";

  const CARGOS_SISTEMA = [
    "Docente",
    "Coordenador",
    "NAE - Atendimento Psicológico",
    "NAE - Assistente Social",
    "NAE - Assistente de Aluno",
    "NAPNE",
    "NEABI",
    "NEPGES"
  ];

  const TIPOS_PERGUNTAS = [
    { value: "texto", label: "Texto curto" },
    { value: "texto_longo", label: "Texto longo" },
    { value: "multipla", label: "Múltipla escolha" },
    { value: "lista_alunos", label: "Lista de Alunos" }
  ];

  export default function FormBuilderView() {
    const [titulo, setTitulo] = useState("Conselho de Classe — Modelo Novo");
    const [descricao, setDescricao] = useState("Descrição do formulário...");
    const [perguntas, setPerguntas] = useState([]);
    const [listaFormularios, setListaFormularios] = useState([]);
    const [editandoId, setEditandoId] = useState(null);
    const [perfisFormulario, setPerfisFormulario] = useState([...CARGOS_SISTEMA]);

    // --- CARREGAR FORMULÁRIOS DO BANCO ---
    const carregarFormularios = async () => {
      try {
        const res = await fetch('http://localhost:5000/formularios');
        if (res.ok) {
          const data = await res.json();
          setListaFormularios(data);
        }
      } catch (error) {
        console.error("Erro ao carregar formulários:", error);
      }
    };

    useEffect(() => {
      carregarFormularios();
    }, []);

    // --- MODELO OFICIAL ATUALIZADO ---
    const gerarModeloPadrao = () => {
      if (perguntas.length > 0 && !window.confirm("Isso substituirá suas perguntas atuais. Continuar?")) return;

      setTitulo("Conselho de Classe — Modelo Oficial Completo");
      setDescricao("Análise por setores: Docente, NAE, NAPNE, NEPGES e NEABI.");
      setPerfisFormulario([...CARGOS_SISTEMA]);

      const P_DOCENTE = ["Docente", "Coordenador"];
      const P_NAE_PSICO = ["NAE - Atendimento Psicológico", "Coordenador"];
      const P_NAE_SOCIAL = ["NAE - Assistente Social", "Coordenador"];
      const P_NAPNE = ["NAPNE", "Coordenador"];
      const P_NEPGES = ["NEPGES", "Coordenador"];
      const P_NEABI = ["NEABI", "Coordenador"];

      setPerguntas([
        { id: generateId(), tipo: "texto_longo", enunciado: "1: Qual(is) Fragilidades e positividades existentes na turma e, consequentemente, proposições e soluções:", perfis: P_DOCENTE },
        { id: generateId(), tipo: "texto_longo", enunciado: "2: Análise sobre a Diciplina da turma:", perfis: P_DOCENTE },
        { id: generateId(), tipo: "multipla", enunciado: "2.1: Qual(is) são as potencialidades da turma?", opcoes: 
        ["𝐄𝐧𝐠𝐚𝐣𝐚𝐦𝐞𝐧𝐭𝐨 𝐝𝐨𝐬 𝐀𝐥𝐮𝐧𝐨𝐬: A turma demonstra interesse ativo nas aulas e nas atividades propostas.", "𝐂𝐨𝐥𝐚𝐛𝐨𝐫𝐚𝐜̧𝐚̃𝐨: Os estudantes trabalham bem juntos em projetos e atividades em grupo.", "𝐏𝐚𝐫𝐭𝐢𝐜𝐢𝐩𝐚𝐜̧𝐚̃𝐨 𝐞𝐦 𝐃𝐢𝐬𝐜𝐮𝐬𝐬𝐨̃𝐞𝐬: Os alunos participam ativamente das discussões em sala de aula, contribuindo com ideias e perguntas relevantes.", "𝐑𝐞𝐬𝐩𝐞𝐢𝐭𝐨 𝐌𝐮́𝐭𝐮𝐨: Há um ambiente de respeito e aceitação entre os alunos, independentemente de suas diferenças.", "𝐀𝐥𝐮𝐧𝐨𝐬 𝐌𝐨𝐭𝐢𝐯𝐚𝐝𝐨𝐬: A maioria dos alunos demonstra motivação para aprender e busca conhecimento além do que é ensinado em sala de aula.", "𝐅𝐨𝐜𝐨 𝐧𝐚 𝐌𝐞𝐥𝐡𝐨𝐫𝐢𝐚: Os estudantes estão dispostos a ouvir feedback construtivo e trabalhar para melhorar seu desempenho.","𝐑𝐞𝐬𝐢𝐥𝐢𝐞̂𝐧𝐜𝐢𝐚: A turma lida bem com desafios e adversidades acadêmicas, mantendo uma atitude positiva.","𝐏𝐚𝐫𝐭𝐢𝐜𝐢𝐩𝐚𝐜̧𝐚̃𝐨 𝐞𝐦 𝐀𝐭𝐢𝐯𝐢𝐝𝐚𝐝𝐞𝐬 𝐄𝐱𝐭𝐫𝐚𝐜𝐮𝐫𝐫𝐢𝐜𝐮𝐥𝐚𝐫𝐞𝐬: Os alunos participam ativamente de clubes, equipes esportivas ou outras atividades fora do horário regular de aulas.","𝐂𝐨𝐦𝐮𝐧𝐢𝐜𝐚𝐜̧𝐚̃𝐨 𝐄𝐟𝐢𝐜𝐚𝐳: A turma se comunica de forma eficaz com os professores, esclarecendo dúvidas e buscando orientação quando necessário.","𝐈𝐧𝐢𝐜𝐢𝐚𝐭𝐢𝐯𝐚: Os alunos mostram iniciativa ao propor novas ideias ou projetos.","𝐇𝐚𝐛𝐢𝐥𝐢𝐝𝐚𝐝𝐞 𝐝𝐞 𝐑𝐞𝐬𝐨𝐥𝐮𝐜̧𝐚̃𝐨 𝐝𝐞 𝐂𝐨𝐧𝐟𝐥𝐢𝐭𝐨𝐬: A turma lida bem com conflitos internos, buscando soluções construtivas.","𝐀𝐜𝐞𝐢𝐭𝐚𝐜̧𝐚̃𝐨 𝐝𝐚 𝐃𝐢𝐯𝐞𝐫𝐬𝐢𝐝𝐚𝐝𝐞: Os estudantes demonstram respeito e aceitação pela diversidade de origens, culturas e perspectivas na sala de aula.","𝐅𝐫𝐞𝐪𝐮𝐞̂𝐧𝐜𝐢𝐚 𝐚̀𝐬 𝐀𝐮𝐥𝐚𝐬: A maioria dos alunos está regularmente presente nas aulas, minimizando as faltas.","𝐀𝐩𝐫𝐨𝐯𝐞𝐢𝐭𝐚𝐦𝐞𝐧𝐭𝐨 𝐝𝐨 𝐓𝐞𝐦𝐩𝐨 𝐝𝐞 𝐄𝐬𝐭𝐮𝐝𝐨: A turma faz bom uso do tempo de estudo e tarefas de casa, evitando procrastinação.","𝐀𝐭𝐞𝐧𝐜̧𝐚̃𝐨 𝐚̀𝐬 𝐍𝐨𝐫𝐦𝐚𝐬 𝐞 𝐑𝐞𝐠𝐮𝐥𝐚𝐦𝐞𝐧𝐭𝐨𝐬: Os alunos seguem as regras da escola e do ambiente acadêmico.","𝐇𝐚𝐛𝐢𝐥𝐢𝐝𝐚𝐝𝐞𝐬 𝐝𝐞 𝐀𝐮𝐭𝐨𝐝𝐢𝐫𝐞𝐜̧𝐚̃𝐨: Os estudantes demonstram habilidades para gerenciar seu próprio aprendizado.","𝐏𝐚𝐫𝐭𝐢𝐜𝐢𝐩𝐚𝐜̧𝐚̃𝐨 𝐝𝐨𝐬 𝐏𝐚𝐢𝐬/𝐑𝐞𝐬𝐩𝐨𝐧𝐬𝐚́𝐯𝐞𝐢𝐬: Os pais ou responsáveis estão envolvidos na educação de seus filhos e apoiam o trabalho dos professores.", "Outros"], perfis: P_DOCENTE },
        { id: generateId(), tipo: "multipla", enunciado: "2.2: Qual(is) são as fragilidades da turma?", opcoes: 
        ["𝐁𝐚𝐢𝐱𝐨 𝐄𝐧𝐯𝐨𝐥𝐯𝐢𝐦𝐞𝐧𝐭𝐨 𝐝𝐨𝐬 𝐀𝐥𝐮𝐧𝐨𝐬: Alguns alunos demonstram desinteresse nas aulas e atividades escolares.", "𝐃𝐢𝐟𝐢𝐜𝐮𝐥𝐝𝐚𝐝𝐞 𝐧𝐚 𝐂𝐨𝐥𝐚𝐛𝐨𝐫𝐚𝐜̧𝐚̃𝐨: Há falta de cooperação ou conflitos frequentes entre os estudantes durante atividades em grupo.", "𝐏𝐚𝐫𝐭𝐢𝐜𝐢𝐩𝐚𝐜̧𝐚̃𝐨 𝐋𝐢𝐦𝐢𝐭𝐚𝐝𝐚 𝐞𝐦 𝐃𝐢𝐬𝐜𝐮𝐬𝐬𝐨̃𝐞𝐬: Alguns alunos são passivos nas discussões em sala de aula, evitando contribuir com perguntas ou ideias.", "𝐅𝐚𝐥𝐭𝐚 𝐝𝐞 𝐑𝐞𝐬𝐩𝐞𝐢𝐭𝐨 𝐌𝐮́𝐭𝐮𝐨: Ocorrem casos de desrespeito, discriminação ou bullying entre os alunos.", "𝐅𝐚𝐥𝐭𝐚 𝐝𝐞 𝐌𝐨𝐭𝐢𝐯𝐚𝐜̧𝐚̃𝐨: Alguns estudantes demonstram falta de motivação para aprender ou para buscar conhecimento adicional.", "𝐃𝐢𝐟𝐢𝐜𝐮𝐥𝐝𝐚𝐝𝐞 𝐞𝐦 𝐀𝐜𝐞𝐢𝐭𝐚𝐫 𝐅𝐞𝐞𝐝𝐛𝐚𝐜𝐤: Alguns alunos resistem ao feedback construtivo e têm dificuldade em melhorar seu desempenho.","𝐅𝐫𝐚𝐠𝐢𝐥𝐢𝐝𝐚𝐝𝐞 𝐃𝐢𝐚𝐧𝐭𝐞 𝐝𝐞 𝐃𝐞𝐬𝐚𝐟𝐢𝐨𝐬: A turma tem dificuldade em lidar com desafios acadêmicos, levando a uma desmotivação geral.","𝐁𝐚𝐢𝐱𝐚 𝐏𝐚𝐫𝐭𝐢𝐜𝐢𝐩𝐚𝐜̧𝐚̃𝐨 𝐞𝐦 𝐀𝐭𝐢𝐯𝐢𝐝𝐚𝐝𝐞𝐬 𝐄𝐱𝐭𝐫𝐚𝐜𝐮𝐫𝐫𝐢𝐜𝐮𝐥𝐚𝐫𝐞𝐬: Poucos alunos se envolvem em clubes, esportes ou outras atividades fora do horário de aulas.","𝐂𝐨𝐦𝐮𝐧𝐢𝐜𝐚𝐜̧𝐚̃𝐨 𝐈𝐧𝐞𝐟𝐢𝐜𝐚𝐳: Há problemas de comunicação entre os alunos e com os professores, dificultando a compreensão mútua.","𝐅𝐫𝐞𝐪𝐮𝐞̂𝐧𝐜𝐢𝐚 𝐈𝐫𝐫𝐞𝐠𝐮𝐥𝐚𝐫 𝐚̀𝐬 𝐀𝐮𝐥𝐚𝐬: Alguns alunos faltam frequentemente às aulas, prejudicando seu aprendizado.","𝐏𝐫𝐨𝐜𝐫𝐚𝐬𝐭𝐢𝐧𝐚𝐜̧𝐚̃𝐨: Alunos adiam tarefas e estudos, o que afeta negativamente o desempenho acadêmico.","𝐃𝐞𝐬𝐫𝐞𝐬𝐩𝐞𝐢𝐭𝐨 𝐚̀𝐬 𝐍𝐨𝐫𝐦𝐚𝐬 𝐞 𝐑𝐞𝐠𝐮𝐥𝐚𝐦𝐞𝐧𝐭𝐨𝐬: Alguns estudantes quebram as regras da escola, causando problemas disciplinares.","𝐍𝐞𝐜𝐞𝐬𝐬𝐢𝐝𝐚𝐝𝐞 𝐝𝐞 𝐀𝐩𝐨𝐢𝐨: Alguns alunos requerem apoio adicional devido a dificuldades de aprendizado ou questões pessoais.","𝐅𝐚𝐥𝐭𝐚 𝐝𝐞 𝐀𝐮𝐭𝐨𝐝𝐢𝐫𝐞𝐜̧𝐚̃𝐨: Alguns estudantes têm dificuldade em gerenciar seu próprio aprendizado de forma independente.","𝐏𝐨𝐮𝐜𝐨 𝐄𝐧𝐯𝐨𝐥𝐯𝐢𝐦𝐞𝐧𝐭𝐨 𝐝𝐨𝐬 𝐏𝐚𝐢𝐬/𝐑𝐞𝐬𝐩𝐨𝐧𝐬𝐚́𝐯𝐞𝐢𝐬: Pais ou responsáveis não estão envolvidos na educação de seus filhos ou não apoiam o trabalho dos professores.","𝐂𝐨𝐧𝐯𝐞𝐫𝐬𝐚𝐬 𝐩𝐚𝐫𝐚𝐥𝐞𝐥𝐚𝐬: Os estudantes conversam demais sobre assuntos não pertinentes no horário da aula.","Outros"], perfis: P_DOCENTE },
        { id: generateId(), tipo: "lista_alunos", enunciado: "3: Qual(is) estudante(s) é(são) destaque(s)?", perfis: P_DOCENTE },
        { id: generateId(), tipo: "lista_alunos", enunciado: "4: Qual(is) estudante(s) é(são) infrequentes(?)", perfis: P_DOCENTE },
        { id: generateId(), tipo: "lista_alunos", enunciado: "5: Qual(is) estudante(s) apresenta(m) maior dificuldade de aprendizagem?", perfis: P_DOCENTE },
        { id: generateId(), tipo: "texto_longo", enunciado: "5.1: Se achar conveniente, detalhe a(s) dificuldade(s). Você pode citar o(a) estudante, se achar necessário.", perfis: P_DOCENTE },
        { id: generateId(), tipo: "lista_alunos", enunciado: "6: Qual(is) estudante(s) não atingiram a média (nota) no trimestre:", perfis: P_DOCENTE },
        { id: generateId(), tipo: "lista_alunos", enunciado: "7: Você sugere que algum estudante seja encaminhado ao atendimento psicologico? se sim qual(is)?", perfis: P_NAE_PSICO },
        { id: generateId(), tipo: "lista_alunos", enunciado: "8: Qual(is) estudante(s) foi(ram) atendido(s) pelo apoio psicologioco?", perfis: P_NAE_PSICO  },
        { id: generateId(), tipo: "lista_alunos", enunciado: "9: Qual(is) estudante(s) com nessecidades especificas foi(ram) atendido(s)?", perfis: P_NAE_SOCIAL  },
        { id: generateId(), tipo: "texto_longo", enunciado: "10 (NAE): Considerações do Assistente do Aluno", perfis: P_NAE_SOCIAL },
        { id: generateId(), tipo: "texto_longo", enunciado: "11 (NAPNE): Relação de discentes com necessidades específicas (descrever tipo de atendimento necessário):", perfis: P_NAPNE },
        { id: generateId(), tipo: "multipla", enunciado: "12: (NEPGES) Ações sobre gênero e sexualidade?", opcoes: ["Sim", "Não"], perfis: P_NEPGES },
        { id: generateId(), tipo: "texto_longo", enunciado: "12.1: Relate as ações:", perfis: P_NEPGES },
        { id: generateId(), tipo: "multipla", enunciado: "13: (NEABI) Ações sobre relações étnico-raciais?", opcoes: ["Sim", "Não"], perfis: P_NEABI },
        { id: generateId(), tipo: "texto_longo", enunciado: "13.1: Relate as ações:", perfis: P_NEABI }
      ]);
    };

    // --- FUNÇÕES DE MANIPULAÇÃO ---
    const addPergunta = (tipo) => {
      setPerguntas([...perguntas, { 
        id: generateId(), 
        tipo, 
        enunciado: "", 
        opcoes: tipo === "multipla" ? ["Sim", "Não"] : undefined, 
        perfis: [...CARGOS_SISTEMA] 
      }]);
    };

    const removePergunta = (id) => setPerguntas(perguntas.filter(p => p.id !== id));

    const updatePergunta = (id, campo, valor) => {
      setPerguntas(perguntas.map(p => p.id === id ? { ...p, [campo]: valor } : p));
    };

    const toggleCargo = (idPergunta, cargo) => {
      setPerguntas(perguntas.map(p => {
        if (p.id !== idPergunta) return p;
        const novosPerfis = p.perfis.includes(cargo) 
          ? p.perfis.filter(c => c !== cargo) 
          : [...p.perfis, cargo];
        return { ...p, perfis: novosPerfis };
      }));
    };

    // --- SALVAR, EDITAR E EXCLUIR ---
    const salvarFormulario = async () => {
      if (!titulo.trim() || perguntas.length === 0) return alert("Preencha título e questões.");
      
      // Validação: cada pergunta deve ter pelo menos um perfil
      for (const pergunta of perguntas) {
        if (!pergunta.perfis || pergunta.perfis.length === 0) {
          return alert(`A pergunta "${pergunta.enunciado || 'sem título'}" não tem perfis selecionados.`);
        }
      }
      
      try {
        // --- CORREÇÃO AQUI ---
        // Se estiver editando, adiciona o ID na URL. Se for novo, usa a URL base.
        const url = editandoId 
          ? `http://localhost:5000/formularios/${editandoId}` 
          : 'http://localhost:5000/formularios';

        const res = await fetch(url, {
          method: editandoId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            // id: editandoId, // Geralmente não é necessário enviar o ID no corpo em PUT, mas não costuma atrapalhar
            titulo, 
            descricao, 
            perfis: perfisFormulario,
            perguntas 
          })
        });
        
        if (res.ok) {
          const data = await res.json(); // É seguro fazer o parse aqui pois deu sucesso
          alert(editandoId ? "✅ Formulário atualizado com sucesso!" : "✅ Formulário salvo com sucesso!");
          
          // Limpeza do estado
          setEditandoId(null);
          setTitulo("Conselho de Classe — Modelo Novo");
          setDescricao("Descrição do formulário...");
          setPerfisFormulario([...CARGOS_SISTEMA]);
          setPerguntas([]);
          carregarFormularios();
        } else {
          // Tratamento para evitar quebra se o erro não for JSON
          const text = await res.text();
          try {
              const error = JSON.parse(text);
              alert(`Erro ao salvar: ${error.message || 'Erro desconhecido'}`);
          } catch {
              console.error("Erro não-JSON recebido:", text);
              alert(`Erro ao salvar (Status ${res.status}). Verifique o console.`);
          }
        }
      } catch (e) { 
        console.error("Erro ao salvar:", e);
        alert("Erro de conexão ao salvar formulário.");
      }
    };
    
    const handleEditar = (form) => {
      setEditandoId(form.id);
      setTitulo(form.titulo);
      setDescricao(form.descricao || "");
      setPerfisFormulario(form.perfis || [...CARGOS_SISTEMA]);
      setPerguntas(form.perguntas || []);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleExcluir = async (id) => {
      if (!window.confirm("Deseja apagar permanentemente este modelo?\nEsta ação não pode ser desfeita.")) return;
      try {
        const res = await fetch(`http://localhost:5000/formularios/${id}`, { method: 'DELETE' });
        if (res.ok) {
          alert("✅ Formulário excluído!");
          carregarFormularios();
        } else {
          const error = await res.json();
          alert(`Erro ao excluir: ${error.message || 'Erro desconhecido'}`);
        }
      } catch (e) { 
        console.error("Erro ao excluir:", e);
        alert("Erro de conexão ao excluir formulário.");
      }
    };

    const handleCancelarEdicao = () => {
      setEditandoId(null);
      setTitulo("Conselho de Classe — Modelo Novo");
      setDescricao("Descrição do formulário...");
      setPerfisFormulario([...CARGOS_SISTEMA]);
      setPerguntas([]);
    };

    // Renderiza configurações específicas para cada tipo de pergunta
    const renderConfigTipoPergunta = (pergunta) => {
      switch (pergunta.tipo) {
        case "multipla":
          return (
            <div className="p-3 bg-gray-50 rounded-lg border">
              <label className="text-xs font-bold text-gray-500 uppercase block mb-1">
                Opções de resposta (separadas por vírgula)
              </label>
              <input
                className="w-full border p-2 rounded bg-white text-sm"
                value={(pergunta.opcoes || []).join(", ")}
                onChange={(e) =>
                  updatePergunta(
                    pergunta.id,
                    "opcoes",
                    e.target.value.split(",").map(o => o.trim()).filter(o => o.length > 0)
                  )
                }
                placeholder="Ex: Sim, Não, Talvez"
              />
              <div className="text-xs text-gray-500 mt-1">
                {pergunta.opcoes?.length || 0} opção(ões) configurada(s)
              </div>
            </div>
          );

        case "lista_alunos":
          return (
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-green-700">✓</span>
                <span className="text-xs font-bold text-green-700 uppercase">
                  Tipo: Lista de Alunos
                </span>
              </div>
              <p className="text-xs text-gray-600 mb-1">
                Esta pergunta exibirá uma lista com todos os alunos da turma selecionada.
              </p>
              <p className="text-xs text-gray-500">
                O usuário poderá selecionar múltiplos alunos. Os dados serão salvos como uma lista de nomes separados por vírgula.
              </p>
            </div>
          );

        case "texto":
          return (
            <div className="p-3 bg-gray-50 rounded-lg border">
              <p className="text-xs text-gray-600">
                Campo de texto curto (uma linha)
              </p>
            </div>
          );

        case "texto_longo":
          return (
            <div className="p-3 bg-gray-50 rounded-lg border">
              <p className="text-xs text-gray-600">
                Campo de texto longo (várias linhas)
              </p>
            </div>
          );

        default:
          return null;
      }
    };

    return (
      <div className="bg-gray-100 min-h-[calc(100vh-64px)]">
        <div className="max-w-7xl mx-auto p-6 space-y-6">

          {/* CABEÇALHO */}
          <header className="bg-white rounded-xl shadow-md border p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-red-700"></div>
            <h1 className="text-2xl font-bold text-green-800">
              Gerenciamento de Formulários
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Criação e manutenção dos modelos de Conselho de Classe
            </p>
            {editandoId && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Modo edição ativo:</strong> Você está editando um formulário existente.
                </p>
              </div>
            )}
          </header>

          {/* EDITOR DE FORMULÁRIO */}
          <section className="bg-white p-6 rounded-xl shadow-md border space-y-8">

            {/* TOPO */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 border-b pb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {editandoId ? `Editando: ${titulo}` : "Criar novo formulário"}
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={gerarModeloPadrao}
                  className="bg-green-700 text-white px-5 py-2 rounded-lg font-semibold hover:bg-green-800 transition-all"
                >
                  Carregar modelo oficial
                </button>
                {editandoId && (
                  <button
                    onClick={handleCancelarEdicao}
                    className="bg-gray-300 text-gray-700 px-5 py-2 rounded-lg font-semibold hover:bg-gray-400 transition-all"
                  >
                    Cancelar edição
                  </button>
                )}
              </div>
            </div>

            {/* TÍTULO / DESCRIÇÃO */}
            <div className="grid gap-6">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Título do formulário *
                </label>
                <input
                  className="w-full text-lg font-semibold border-b-2 border-gray-200 p-2 outline-none focus:border-green-700 transition-all bg-transparent"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex: Conselho de Classe 2026"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Descrição / instruções
                </label>
                <textarea
                  className="w-full p-3 border rounded-lg bg-gray-50 focus:bg-white transition-all outline-none"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  rows={2}
                />
              </div>
            </div>

            {/* PERFIS DO FORMULÁRIO (QUEM PODE VER) */}
            <div className="p-5 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-xs font-bold text-gray-700 uppercase mb-3">
                Perfis que podem VER este formulário
              </p>
              <p className="text-sm text-gray-600 mb-3">
                Selecione quais perfis terão acesso a este formulário na área de colaboração:
              </p>
              <div className="flex flex-wrap gap-2">
                {CARGOS_SISTEMA.map((cargo) => {
                  const ativo = perfisFormulario.includes(cargo);
                  return (
                    <button
                      key={cargo}
                      onClick={() => {
                        const novosPerfis = ativo
                          ? perfisFormulario.filter(c => c !== cargo)
                          : [...perfisFormulario, cargo];
                        setPerfisFormulario(novosPerfis);
                      }}
                      className={`text-sm px-4 py-2 rounded-full border transition-all ${
                        ativo
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "bg-white border-gray-300 text-gray-700 hover:border-gray-500"
                      }`}
                    >
                      {cargo}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 text-xs text-gray-500">
                <strong>Selecionados:</strong> {perfisFormulario.length} de {CARGOS_SISTEMA.length} perfis
              </div>
            </div>

            {/* ADICIONAR PERGUNTAS */}
            <div className="flex flex-wrap gap-3 p-4 bg-gray-50 rounded-xl border">
              <span className="text-sm font-bold text-gray-700 w-full">
                Adicionar pergunta
              </span>
              {TIPOS_PERGUNTAS.map(tipo => (
                <button
                  key={tipo.value}
                  onClick={() => addPergunta(tipo.value)}
                  className="bg-white border px-4 py-1.5 rounded-lg text-sm hover:bg-gray-100"
                >
                  {tipo.label}
                </button>
              ))}
              <div className="ml-auto text-xs text-gray-500">
                {perguntas.length} pergunta(s) adicionada(s)
              </div>
            </div>

            {/* PERGUNTAS */}
            <div className="space-y-6">
              {perguntas.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed rounded-xl">
                  <p className="text-gray-500">Nenhuma pergunta adicionada.</p>
                  <p className="text-sm text-gray-400 mt-1">Use os botões acima para adicionar perguntas.</p>
                </div>
              ) : (
                perguntas.map((p, idx) => (
                  <div
                    key={p.id}
                    className="p-5 bg-white border rounded-xl shadow-sm space-y-4"
                  >
                    <div className="flex justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-gray-800 text-white text-xs px-2 py-0.5 rounded-full">
                            Q{idx + 1}
                          </span>
                          <span className={`text-xs font-bold uppercase ${
                            p.tipo === "lista_alunos" ? "text-green-700" : "text-gray-400"
                          }`}>
                            {TIPOS_PERGUNTAS.find(t => t.value === p.tipo)?.label || p.tipo}
                          </span>
                        </div>
                        <input
                          className="w-full border-b border-gray-300 font-medium p-1 outline-none focus:border-green-700"
                          value={p.enunciado}
                          onChange={(e) =>
                            updatePergunta(p.id, "enunciado", e.target.value)
                          }
                          placeholder="Digite o enunciado da pergunta"
                        />
                      </div>
                      <button
                        onClick={() => removePergunta(p.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        title="Remover pergunta"
                      >
                        ✕ Remover
                      </button>
                    </div>

                    {/* CONFIGURAÇÕES ESPECÍFICAS DO TIPO */}
                    {renderConfigTipoPergunta(p)}

                    {/* PERFIS DA PERGUNTA (QUEM PODE RESPONDER) */}
                    <div className="pt-3 border-t">
                      <p className="text-xs font-bold text-gray-500 uppercase mb-2">
                        Perfis que podem RESPONDER esta pergunta
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {CARGOS_SISTEMA.map((cargo) => {
                          const ativo = p.perfis?.includes(cargo) || false;
                          return (
                            <button
                              key={cargo}
                              onClick={() => toggleCargo(p.id, cargo)}
                              className={`text-xs px-3 py-1 rounded-full border transition-all ${
                                ativo
                                  ? "bg-green-600 border-green-600 text-white"
                                  : "bg-white border-gray-300 text-gray-500 hover:border-gray-500"
                              }`}
                            >
                              {cargo}
                            </button>
                          );
                        })}
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        <strong>Selecionados:</strong> {p.perfis?.length || 0} de {CARGOS_SISTEMA.length} perfis
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* SALVAR */}
            <div className="pt-4 border-t">
              <button
                onClick={salvarFormulario}
                disabled={!titulo.trim() || perguntas.length === 0}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                  !titulo.trim() || perguntas.length === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-green-700 text-white hover:bg-green-800"
                }`}
              >
                {editandoId ? "Atualizar formulário" : "Salvar formulário"}
              </button>
              {(!titulo.trim() || perguntas.length === 0) && (
                <p className="text-sm text-red-600 mt-2 text-center">
                  {!titulo.trim() && "• O título é obrigatório<br />"}
                  {perguntas.length === 0 && "• Adicione pelo menos uma pergunta"}
                </p>
              )}
            </div>
          </section>

          {/* LISTA DE MODELOS */}
          <section className="bg-white p-6 rounded-xl shadow-md border">
            <h3 className="font-bold text-xl mb-6 text-gray-800">
              Formulários disponíveis ({listaFormularios.length})
            </h3>

            <div className="grid gap-4">
              {listaFormularios.map((f) => (
                <div
                  key={f.id}
                  className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 p-5 border rounded-xl hover:bg-gray-50 transition-all"
                >
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800">
                      {f.titulo}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {f.descricao || "Sem descrição"}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                        {f.perguntas?.length || 0} questões
                      </span>
                      <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                        {f.perguntas?.filter(p => p.tipo === "lista_alunos").length || 0} lista(s) de alunos
                      </span>
                      {f.perfis && f.perfis.length > 0 && (
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                          {f.perfis.length} perfil(s) permitido(s)
                        </span>
                      )}
                      {editandoId === f.id && (
                        <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                          Editando
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditar(f)}
                      className="bg-white border border-green-600 text-green-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-600 hover:text-white transition-all"
                    >
                      {editandoId === f.id ? "Continuar editando" : "Editar"}
                    </button>
                    <button
                      onClick={() => handleExcluir(f.id)}
                      className="bg-white border border-red-300 text-red-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 hover:text-white transition-all"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))}

              {listaFormularios.length === 0 && (
                <div className="text-center py-10 text-gray-400 border-2 border-dashed rounded-xl">
                  <p className="mb-2">Nenhum formulário salvo ainda.</p>
                  <p className="text-sm">Crie seu primeiro formulário acima.</p>
                </div>
              )}
            </div>
          </section>

        </div>
      </div>
    );
  }