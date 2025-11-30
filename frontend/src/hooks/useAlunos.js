import { useState, useEffect } from "react";

const API_URL = "http://127.0.0.1:5000/api/alunos";

export function useAlunos() {
  const [alunos, setAlunos] = useState([]);

  const fetchAlunos = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setAlunos(data);
    } catch (error) {
      console.error("Erro ao buscar alunos:", error);
    }
  };

  useEffect(() => {
    fetchAlunos();
  }, []);

  const add = async (alunoData) => {
    // Para enviar ARQUIVOS (fotos), precisamos usar FormData em vez de JSON
    const formData = new FormData();
    formData.append("nome", alunoData.nome);
    formData.append("matricula", alunoData.matricula);
    formData.append("turmaId", alunoData.turmaId);
    
    // Se tiver foto, anexa ao envio
    if (alunoData.fotoArquivo) {
      formData.append("foto", alunoData.fotoArquivo);
    }

    try {
      await fetch(API_URL, {
        method: "POST",
        body: formData, // O navegador define o cabeçalho correto automaticamente
      });
      fetchAlunos(); // Atualiza a lista na tela
    } catch (error) {
      console.error("Erro ao adicionar aluno:", error);
    }
  };

  const update = (id, patch) => console.log("Editar não implementado na API ainda");
  const remove = (id) => console.log("Remover não implementado na API ainda");

  return { alunos, add, update, remove };
}