import { useState, useEffect } from "react";
import { readLS, writeLS, LS_KEYS } from "../lib/storage";

export function useAlunos() {
  const [alunos, setAlunos] = useState(() => readLS(LS_KEYS.ALUNOS, []));
  
  useEffect(() => writeLS(LS_KEYS.ALUNOS, alunos), [alunos]);
  
  const add = (a) =>
    setAlunos((x) => [...x, { ...a, id: crypto.randomUUID() }]);
  
  const update = (id, patch) =>
    setAlunos((x) => x.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  
  const remove = (id) => setAlunos((x) => x.filter((a) => a.id !== id));
  
  return { alunos, add, update, remove };
}