// Constantes e funções de LocalStorage
export const LS_KEYS = {
  USERS: "cc_users",
  AUTH: "cc_auth",
  TURMAS: "cc_turmas",
  ALUNOS: "cc_alunos",
  FORMS: "cc_forms",
  RESPOSTAS: "cc_respostas",
};

export function readLS(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (_) {
    return fallback;
  }
}

export function writeLS(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}