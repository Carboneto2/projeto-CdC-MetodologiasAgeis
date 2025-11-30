import { useState, useEffect } from "react";

const API_URL_FORMS = "http://127.0.0.1:5000/api/forms";
const API_URL_RESPOSTAS = "http://127.0.0.1:5000/api/respostas";

export function useForms() {
  const [forms, setForms] = useState([]);
  const [respostas, setRespostas] = useState([]);

  // Buscar dados
  const fetchData = async () => {
    try {
      const [resF, resR] = await Promise.all([
        fetch(API_URL_FORMS),
        fetch(API_URL_RESPOSTAS)
      ]);
      setForms(await resF.json());
      setRespostas(await resR.json());
    } catch (error) {
      console.error("Erro ao carregar conselho:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Adicionar Formulário
  const addForm = async (f) => {
    await fetch(API_URL_FORMS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(f),
    });
    fetchData();
  };

  const removeForm = async (id) => {
    await fetch(`${API_URL_FORMS}/${id}`, { method: "DELETE" });
    fetchData();
  };
  
  // (UpdateForm pode ser implementado depois)
  const updateForm = () => console.log("Update não implementado");

  // Adicionar Resposta
  const addResposta = async (formId, turmaId, alunoId, payload) => {
    await fetch(API_URL_RESPOSTAS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formId, turmaId, alunoId, payload }),
    });
    fetchData();
  };

  const removeResposta = () => console.log("Delete resposta não implementado");

  return { forms, addForm, updateForm, removeForm, respostas, addResposta, removeResposta };
}