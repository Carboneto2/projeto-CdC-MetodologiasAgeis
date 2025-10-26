import { useState, useEffect } from "react";
import { readLS, writeLS, LS_KEYS } from "../lib/storage";

export function useTurmas() {
  const [turmas, setTurmas] = useState(() => readLS(LS_KEYS.TURMAS, []));
  useEffect(() => writeLS(LS_KEYS.TURMAS, turmas), [turmas]);
  const add = (t) =>
    setTurmas((x) => [...x, { ...t, id: crypto.randomUUID() }]);
  const update = (id, patch) =>
    setTurmas((x) => x.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  const remove = (id) => setTurmas((x) => x.filter((t) => t.id !== id));
  return { turmas, add, update, remove };
}