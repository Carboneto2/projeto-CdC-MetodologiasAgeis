export const modeloConselhoPadrao = {
  titulo: "Formulário de Conselho de Classe - Modelo Padrão",
  descricao: "Modelo Padrão Oficial do Conselho — perguntas completas conforme formulário institucional.",
  perguntas: [
    {
      tipo: "texto_longo",
      enunciado: "Coordenador de Curso — Fragilidades e positividades existentes na turma e, consequentemente, proposições e soluções:"
    },
    {
      tipo: "texto",
      enunciado: "Docente - Análise da Turma — Disciplina:"
    },
    {
      tipo: "multipla",
      enunciado: "Docente - Análise da Turma — Potencialidades: Em sua opinião, quais são as 𝐩𝐨𝐭𝐞𝐧𝐜𝐢𝐚𝐥𝐢𝐝𝐚𝐝𝐞𝐬 da turma?",
      opcoes: [
        "𝐄𝐧𝐠𝐚𝐣𝐚𝐦𝐞𝐧𝐭𝐨 𝐝𝐨𝐬 𝐀𝐥𝐮𝐧𝐨𝐬: A turma demonstra interesse ativo nas aulas e nas atividades propostas.",
        "𝐂𝐨𝐥𝐚𝐛𝐨𝐫𝐚𝐜̧𝐚̃𝐨: Os estudantes trabalham bem juntos em projetos e atividades em grupo.",
        "𝐏𝐚𝐫𝐭𝐢𝐜𝐢𝐩𝐚𝐜̧𝐚̃𝐨 𝐞𝐦 𝐃𝐢𝐬𝐜𝐮𝐬𝐬𝐨̃𝐞𝐬: Os alunos participam ativamente das discussões em sala de aula, contribuindo com ideias e perguntas relevantes.",
        "𝐑𝐞𝐬𝐩𝐞𝐢𝐭𝐨 𝐌𝐮́𝐭𝐮𝐨: Há um ambiente de respeito e aceitação entre os alunos, independentemente de suas diferenças.",
        "𝐀𝐥𝐮𝐧𝐨𝐬 𝐌𝐨𝐭𝐢𝐯𝐚𝐝𝐨𝐬: A maioria dos alunos demonstra motivação para aprender e busca conhecimento além do que é ensinado em sala de aula.",
        "𝐅𝐨𝐜𝐨 𝐧𝐚 𝐌𝐞𝐥𝐡𝐨𝐫𝐢𝐚: Os estudantes estão dispostos a ouvir feedback construtivo e trabalhar para melhorar seu desempenho.",
        "𝐑𝐞𝐬𝐢𝐥𝐢𝐞̂𝐧𝐜𝐢𝐚: A turma lida bem com desafios e adversidades acadêmicas, mantendo uma atitude positiva.",
        "𝐏𝐚𝐫𝐭𝐢𝐜𝐢𝐩𝐚𝐜̧𝐚̃𝐨 𝐞𝐦 𝐀𝐭𝐢𝐯𝐢𝐝𝐞𝐬 𝐄𝐱𝐭𝐫𝐚𝐜𝐮𝐫𝐫𝐢𝐜𝐮𝐥𝐚𝐫𝐞𝐬: Os alunos participam ativamente de clubes, equipes esportivas ou outras atividades fora do horário regular de aulas.",
        "𝐂𝐨𝐦𝐮𝐧𝐢𝐜𝐚𝐜̧𝐚̃𝐨 𝐄𝐟𝐢𝐜𝐚𝐳: A turma se comunica de forma eficaz com os professores, esclarecendo dúvidas e buscando orientação quando necessário.",
        "𝐈𝐧𝐢𝐜𝐢𝐚𝐭𝐢𝐯𝐚: Os alunos mostram iniciativa ao propor novas ideias ou projetos.",
        "𝐇𝐚𝐛𝐢𝐥𝐢𝐝𝐚𝐝𝐞 𝐝𝐞 𝐑𝐞𝐬𝐨𝐥𝐮𝐜̧𝐚̃𝐨 𝐝𝐞 𝐂𝐨𝐧𝐟𝐥𝐢𝐭𝐨𝐬: A turma lida bem com conflitos internos, buscando soluções construtivas.",
        "𝐀𝐜𝐞𝐢𝐭𝐚𝐜̧𝐚̃𝐨 𝐝𝐚 𝐃𝐢𝐯𝐞𝐫𝐬𝐢𝐝𝐚𝐝𝐞: Os estudantes demonstram respeito e aceitação pela diversidade de origens, culturas e perspectivas na sala de aula.",
        "𝐅𝐫𝐞𝐪𝐮𝐞̂𝐧𝐜𝐢𝐚 𝐚̀𝐬 𝐀𝐮𝐥𝐚𝐬: A maioria dos alunos está regularmente presente nas aulas, minimizando as faltas.",
        "𝐀𝐩𝐫𝐨𝐯𝐞𝐢𝐭𝐚𝐦𝐞𝐧𝐭𝐨 𝐝𝐨 𝐓𝐞𝐦𝐩𝐨 𝐝𝐞 𝐄𝐬𝐭𝐮𝐝𝐨: A turma faz bom uso do tempo de estudo e tarefas de casa, evitando procrastinação.",
        "𝐀𝐭𝐞𝐧𝐜̧𝐚̃𝐨 𝐚̀𝐬 𝐍𝐨𝐫𝐦𝐚𝐬 𝐞 𝐑𝐞𝐠𝐮𝐥𝐚𝐦𝐞𝐧𝐭𝐨𝐬: Os alunos seguem as regras da escola e do ambiente acadêmico.",
        "𝐇𝐚𝐛𝐢𝐥𝐢𝐝𝐚𝐝𝐞𝐬 𝐝𝐞 𝐀𝐮𝐭𝐨𝐝𝐢𝐫𝐞𝐜̧𝐚̃𝐨: Os estudantes demonstram habilidades para gerenciar seu próprio aprendizado.",
        "𝐏𝐚𝐫𝐭𝐢𝐜𝐢𝐩𝐚𝐜̧𝐚̃𝐨 𝐝𝐨𝐬 𝐏𝐚𝐢𝐬/𝐑𝐞𝐬𝐩𝐨𝐧𝐬𝐚́𝐯𝐞𝐢𝐬: Os pais ou responsáveis estão envolvidos na educação de seus filhos e apoiam o trabalho dos professores.",
        "Outro:"
      ]
    },
    {
      tipo: "multipla",
      enunciado: "Docente - Análise da Turma — Fragilidades: Em sua opinião, quais são as 𝐟𝐫𝐚𝐠𝐢𝐥𝐢𝐝𝐚𝐝𝐞𝐬 da turma?",
      opcoes: [
        "𝐁𝐚𝐢𝐱𝐨 𝐄𝐧𝐯𝐨𝐥𝐯𝐢𝐦𝐞𝐧𝐭𝐨 𝐝𝐨𝐬 𝐀𝐥𝐮𝐧𝐨𝐬: Alguns alunos demonstram desinteresse nas aulas e atividades escolares.",
        "𝐃𝐢𝐟𝐢𝐜𝐮𝐥𝐝𝐚𝐝𝐞 𝐧𝐚 𝐂𝐨𝐥𝐚𝐛𝐨𝐫𝐚𝐜̧𝐚̃𝐨: Há falta de cooperação ou conflitos frequentes entre os estudantes durante atividades em grupo.",
        "𝐏𝐚𝐫𝐭𝐢𝐜𝐢𝐩𝐚𝐜̧𝐚̃𝐨 𝐋𝐢𝐦𝐢𝐭𝐚𝐝𝐚 𝐞𝐦 𝐃𝐢𝐬𝐜𝐮𝐬𝐬𝐨̃𝐞𝐬: Alguns alunos são passivos nas discussões em sala de aula, evitando contribuir com perguntas ou ideias.",
        "𝐅𝐚𝐥𝐭𝐚 𝐝𝐞 𝐑𝐞𝐬𝐩𝐞𝐢𝐭𝐨 𝐌𝐮́𝐭𝐮𝐨: Ocorrem casos de desrespeito, discriminação ou bullying entre os alunos.",
        "𝐅𝐚𝐥𝐭𝐚 𝐝𝐞 𝐌𝐨𝐭𝐢𝐯𝐚𝐜̧𝐚̃𝐨: Alguns estudantes demonstram falta de motivação para aprender ou para buscar conhecimento adicional.",
        "𝐃𝐢𝐟𝐢𝐜𝐮𝐥𝐝𝐚𝐝𝐞 𝐞𝐦 𝐀𝐜𝐞𝐢𝐭𝐚𝐫 𝐅𝐞𝐞𝐝𝐛𝐚𝐜𝐤: Alguns alunos resistem ao feedback construtivo e têm dificuldade em melhorar seu desempenho.",
        "𝐅𝐫𝐚𝐠𝐢𝐥𝐢𝐝𝐚𝐝𝐞 𝐃𝐢𝐚𝐧𝐭𝐞 𝐝𝐞 𝐃𝐞𝐬𝐚𝐟𝐢𝐨𝐬: A turma tem dificuldade em lidar com desafios acadêmicos, levando a uma desmotivação geral.",
        "𝐁𝐚𝐢𝐱𝐚 𝐏𝐚𝐫𝐭𝐢𝐜𝐢𝐩𝐚𝐜̧𝐚̃𝐨 𝐞𝐦 𝐀𝐭𝐢𝐯𝐢𝐝𝐞𝐬 𝐄𝐱𝐭𝐫𝐚𝐜𝐮𝐫𝐫𝐢𝐜𝐮𝐥𝐚𝐫𝐞𝐬: Poucos alunos se envolvem em clubes, esportes ou outras atividades fora do horário de aulas.",
        "𝐂𝐨𝐦𝐮𝐧𝐢𝐜𝐚𝐜̧𝐚̃𝐨 𝐈𝐧𝐞𝐟𝐢𝐜𝐚𝐳: Há problemas de comunicação entre os alunos e com os professores, dificultando a compreensão mútua.",
        "𝐅𝐫𝐞𝐪𝐮𝐞̂𝐧𝐜𝐢𝐚 𝐈𝐫𝐫𝐞𝐠𝐮𝐥𝐚𝐫 𝐚̀𝐬 𝐀𝐮𝐥𝐚𝐬: Alguns alunos faltam frequentemente às aulas, prejudicando seu aprendizado.",
        "𝐏𝐫𝐨𝐜𝐫𝐚𝐬𝐭𝐢𝐧𝐚𝐜̧𝐚̃𝐨: Alunos adiam tarefas e estudos, o que afeta negativamente o desempenho acadêmico.",
        "𝐃𝐞𝐬𝐫𝐞𝐬𝐩𝐞𝐢𝐭𝐨 𝐚̀𝐬 𝐍𝐨𝐫𝐦𝐚𝐬 𝐞 𝐑𝐞𝐠𝐮𝐥𝐚𝐦𝐞𝐧𝐭𝐨𝐬: Alguns estudantes quebram as regras da escola, causando problemas disciplinares.",
        "𝐍𝐞𝐜𝐞𝐬𝐬𝐢𝐝𝐚𝐝𝐞 𝐝𝐞 𝐀𝐩𝐨𝐢𝐨: Alguns alunos requerem apoio adicional devido a dificuldades de aprendizado ou questões pessoais.",
        "𝐅𝐚𝐥𝐭𝐚 𝐝𝐞 𝐀𝐮𝐭𝐨𝐝𝐢𝐫𝐞𝐜̧𝐚̃𝐨: Alguns estudantes têm dificuldade em gerenciar seu próprio aprendizado de forma independente.",
        "𝐏𝐨𝐮𝐜𝐨 𝐄𝐧𝐯𝐨𝐥𝐯𝐢𝐦𝐞𝐧𝐭𝐨 𝐝𝐨𝐬 𝐏𝐚𝐢𝐬/𝐑𝐞𝐬𝐩𝐨𝐧𝐬𝐚́𝐯𝐞𝐢𝐬: Pais ou responsáveis não estão envolvidos na educação de seus filhos ou não apoiam o trabalho dos professores.",
        "𝐂𝐨𝐧𝐯𝐞𝐫𝐬𝐚𝐬 𝐩𝐚𝐫𝐚𝐥𝐞𝐥𝐚𝐬: Os estudantes conversam demais sobre assuntos não pertinentes no horário da aula.",
        "Outro:"
      ]
    },
    // Perguntas dinâmicas (alunos)
    {
      tipo: "multipla",
      enunciado: "Docente - Análise da Turma — Qual(is) é(são) o(s) estudante(s) destaque(s)?",
      opcoes: [] // Será preenchido via código
    },
    {
      tipo: "multipla",
      enunciado: "Docente - Análise da Turma — Qual(is) é(são) o(s) estudante(s) infrequente(s)?",
      opcoes: []
    },
    {
      tipo: "multipla",
      enunciado: "Docente - Análise da Turma — Qual(is) é(são) o(s) discente(s) com maior(es) dificuldade(s) de aprendizagem?",
      opcoes: []
    },
    {
      tipo: "texto_longo",
      enunciado: "Docente - Análise da Turma — Se achar conveniente, detalhe a(s) dificuldade(s). Você pode citar o(a) estudante, se achar necessário."
    },
    {
      tipo: "multipla",
      enunciado: "Docente - Análise de Turma — Quais estudantes não atingiram a média (nota) no trimestre?",
      opcoes: []
    },
    {
      tipo: "multipla",
      enunciado: "Docente - Análise de Turma — Você sugere que algum estudante seja encaminhado ao atendimento psicológico? Se sim, qual(is)?",
      opcoes: []
    },
    // NAE e Outros
    {
      tipo: "multipla",
      enunciado: "NAE — Discentes atendidos pelo serviço de apoio psicológico: Qual(is) estudante(s) foi(ram) atendido(s)?",
      opcoes: []
    },
    {
      tipo: "texto_longo",
      enunciado: "NAE — Qual o tipo de atendimento ofertado?"
    },
    {
      tipo: "multipla",
      enunciado: "NAE — Discentes atendidos pelo serviço social: Qual(is) estudante(s) com necessidades específicas foi(ram) atendido(s)?",
      opcoes: []
    },
    {
      tipo: "texto_longo",
      enunciado: "NAE — Qual o tipo de atendimento necessário?"
    },
    {
      tipo: "texto_longo",
      enunciado: "Assistente de Aluno — Considerações do Assistente do Aluno"
    },
    {
      tipo: "texto_longo",
      enunciado: "NAPNE — Relação de discentes com necessidades específicas (descrever tipo de atendimento necessário):"
    },
    {
      tipo: "multipla", // "radio" mapeado para multipla no nosso sistema
      enunciado: "NEABI — Houve ações com a finalidade de promover a discussão das relações étnico-raciais com a turma?",
      opcoes: ["Sim", "Não"]
    },
    {
      tipo: "texto_longo",
      enunciado: "NEABI — Se sim, relatar as ações:"
    },
    {
      tipo: "multipla",
      enunciado: "NEPGES — Houve ações com a finalidade de promover a discussão sobre gênero e sexualidade com a turma?",
      opcoes: ["Sim", "Não"]
    },
    {
      tipo: "texto_longo",
      enunciado: "NEPGES — Se sim, relatar as ações:"
    },
    {
      tipo: "multipla",
      enunciado: "Pedagogia / Equipe Pedagógica — Houve necessidade de intervenção pedagógica na turma?",
      opcoes: ["Sim", "Não"]
    },
    {
      tipo: "texto_longo",
      enunciado: "Pedagogia / Equipe Pedagógica — Se sim, descreva as intervenções realizadas:"
    },
    {
      tipo: "multipla",
      enunciado: "Coordenação Pedagógica — A turma apresenta dificuldades recorrentes em relação ao processo de ensino-aprendizagem?",
      opcoes: ["Sim", "Não"]
    },
    {
      tipo: "texto_longo",
      enunciado: "Coordenação Pedagógica — Se sim, descreva quais:"
    },
    {
      tipo: "multipla",
      enunciado: "Orientação Educacional — Houve atendimento individualizado com estudantes da turma?",
      opcoes: ["Sim", "Não"]
    },
    {
      tipo: "texto_longo",
      enunciado: "Orientação Educacional — Se sim, relatar os atendimentos:"
    },
    {
      tipo: "multipla",
      enunciado: "Direção Escolar — A turma apresentou alguma situação disciplinar relevante no período?",
      opcoes: ["Sim", "Não"]
    },
    {
      tipo: "texto_longo",
      enunciado: "Direção Escolar — Se sim, descrever a(s) situação(ões):"
    },
    {
      tipo: "texto_longo",
      enunciado: "Conselho de Classe — Espaço destinado para observações gerais sobre a turma, encaminhamentos, sugestões e registros finais:"
    }
  ]
};