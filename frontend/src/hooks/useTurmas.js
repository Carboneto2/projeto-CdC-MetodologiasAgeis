import { useState, useEffect } from "react";

// Endereço do seu Backend Python
const API_URL = "http://127.0.0.1:5000/api/turmas";

export function useTurmas() {
  const [turmas, setTurmas] = useState([]);

  // Função para buscar turmas da API
  const fetchTurmas = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setTurmas(data);
    } catch (error) {
      console.error("Erro ao buscar turmas:", error);
    }
  };

  // Carrega assim que abre a tela
  useEffect(() => {
    fetchTurmas();
  }, []);

  const add = async (novaTurma) => {
    try {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novaTurma),
      });
      fetchTurmas(); // Recarrega a lista atualizada
    } catch (error) {
      console.error("Erro ao adicionar turma:", error);
    }
  };

  // Update e Remove podem ser implementados depois no Backend
  const update = (id, patch) => console.log("Editar não implementado na API ainda");
  const remove = (id) => console.log("Remover não implementado na API ainda");

  return { turmas, add, update, remove };
}