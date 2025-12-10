import { useState, useEffect } from "react";
import { readLS, writeLS, LS_KEYS, generateId } from "../lib/storage";

export function useForms() {
  const [forms, setForms] = useState(() => readLS(LS_KEYS.FORMS, []));
  const [respostas, setRespostas] = useState(() => readLS(LS_KEYS.RESPOSTAS, []));
  
  useEffect(() => writeLS(LS_KEYS.FORMS, forms), [forms]);
  useEffect(() => writeLS(LS_KEYS.RESPOSTAS, respostas), [respostas]);

  const addForm = (f) =>
    setForms((x) => [...x, { ...f, id: generateId() }]); // Usa generateId
  
  const updateForm = (id, patch) =>
    setForms((x) => x.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  
  const removeForm = (id) => setForms((x) => x.filter((f) => f.id !== id));

  const addResposta = (formId, turmaId, alunoId, payload) => {
    setRespostas((x) => [
      ...x,
      {
        id: generateId(), // Usa generateId
        formId,
        turmaId,
        alunoId,
        payload,
        data: new Date().toISOString(),
      },
    ]);
  };
  
  const removeResposta = (id) =>
    setRespostas((x) => x.filter((r) => r.id !== id));

  return {
    forms,
    addForm,
    updateForm,
    removeForm,
    respostas,
    addResposta,
    removeResposta,
  };
}