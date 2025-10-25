import React, { useEffect, useMemo, useState } from "react";

/**
 * Base Web App (single-file React) — substitui uso inicial do Google Forms
 * Funcionalidades:
 *  - Tela de LOGIN (com usuário demo) e registro simples de usuário
 *  - Cadastro de TURMAS e ALUNOS (CRUD básico)
 *  - Criação de FORMULÁRIO do Conselho de Classe (builder com tipos de pergunta)
 *  - PREVIEW e PREENCHIMENTO do formulário
 *  - Armazenamento local (localStorage) — sem backend
 *  - Exportar/Importar JSON (backup)
 *
 * Usuário demo: admin@escola  |  senha: 123456
 *
 * Observação: Este arquivo é auto-contido para facilitar teste/iteração.
 * Para produção, separe em componentes, adicione autenticação real e backend (API REST).
 */

// ---------------------- Helpers de armazenamento ----------------------
const LS_KEYS = {
  USERS: "cc_users",
  AUTH: "cc_auth",
  TURMAS: "cc_turmas",
  ALUNOS: "cc_alunos",
  FORMS: "cc_forms",
  RESPOSTAS: "cc_respostas",
};

function readLS(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (_) {
    return fallback;
  }
}
function writeLS(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ---------------------- Tipos ----------------------
/** @typedef {{ id:string, nome:string, ano:number|string, turno:string }} Turma */
/** @typedef {{ id:string, nome:string, matricula:string, turmaId:string }} Aluno */
/** @typedef {{ id:string, titulo:string, descricao?:string, perguntas: Pergunta[] }} Formulario */
/** @typedef {{ id:string, tipo:"texto"|"texto_longo"|"multipla"|"escala", enunciado:string, opcoes?:string[], min?:number, max?:number }} Pergunta */

// ---------------------- UI primitives (Tailwind) ----------------------
function Button({ className = "", ...props }) {
  return (
    <button
      className={`px-4 py-2 rounded-2xl shadow transition hover:shadow-md disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}

function Input({ className = "", ...props }) {
  return (
    <input
      className={`w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-black/10 ${className}`}
      {...props}
    />
  );
}

function Textarea({ className = "", ...props }) {
  return (
    <textarea
      className={`w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-black/10 ${className}`}
      {...props}
    />
  );
}

function Card({ title, subtitle, right, children, className = "" }) {
  return (
    <div className={`bg-white rounded-2xl shadow p-5 ${className}`}>
      {(title || right || subtitle) && (
        <div className="mb-4 flex items-start gap-3 justify-between">
          <div>
            {title && <h3 className="text-lg font-semibold">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
          {right}
        </div>
      )}
      {children}
    </div>
  );
}

function Tag({ children }) {
  return (
    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 border border-gray-200">{children}</span>
  );
}

// ---------------------- Auth ----------------------
function useAuth() {
  const [user, setUser] = useState(() => readLS(LS_KEYS.AUTH, null));

  useEffect(() => {
    // garante usuário demo
    const users = readLS(LS_KEYS.USERS, []);
    if (!users.find((u) => u.email === "admin@escola")) {
      users.push({ id: crypto.randomUUID(), email: "admin@escola", nome: "Admin", senha: "123456" });
      writeLS(LS_KEYS.USERS, users);
    }
  }, []);

  const login = (email, senha) => {
    const users = readLS(LS_KEYS.USERS, []);
    const u = users.find((x) => x.email === email && x.senha === senha);
    if (u) {
      writeLS(LS_KEYS.AUTH, { id: u.id, email: u.email, nome: u.nome });
      setUser({ id: u.id, email: u.email, nome: u.nome });
      return { ok: true };
    }
    return { ok: false, message: "Credenciais inválidas" };
  };
  const logout = () => {
    localStorage.removeItem(LS_KEYS.AUTH);
    setUser(null);
  };
  const register = (nome, email, senha) => {
    const users = readLS(LS_KEYS.USERS, []);
    if (users.find((u) => u.email === email)) return { ok: false, message: "E-mail já cadastrado" };
    const novo = { id: crypto.randomUUID(), nome, email, senha };
    users.push(novo);
    writeLS(LS_KEYS.USERS, users);
    return { ok: true };
  };
  return { user, login, logout, register };
}

function LoginView({ login, register }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [err, setErr] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setErr("");
    if (isRegister) {
      const r = register(nome.trim(), email.trim(), senha);
      if (!r.ok) return setErr(r.message);
      setIsRegister(false);
      return;
    }
    const r = login(email.trim(), senha);
    if (!r.ok) return setErr(r.message);
    // sucesso: App re-renderiza porque o mesmo hook de auth é usado lá
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card
        className="w-full max-w-md"
        title={isRegister ? "Criar conta" : "Entrar"}
        subtitle="Sistema de Conselho de Classe"
      >
        {err && <div className="mb-3 text-sm text-red-600">{err}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          {isRegister && (
            <div>
              <label className="text-sm">Nome</label>
              <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" required />
            </div>
          )}
          <div>
            <label className="text-sm">E-mail</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@escola" required />
          </div>
          <div>
            <label className="text-sm">Senha</label>
            <Input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="••••••" required />
          </div>
          <div className="flex items-center justify-between">
            <Button className="bg-black text-white" type="submit">{isRegister ? "Registrar" : "Entrar"}</Button>
            <button type="button" className="text-sm underline" onClick={() => setIsRegister((v) => !v)}>
              {isRegister ? "Já tenho conta" : "Criar conta"}
            </button>
          </div>
          <div className="text-xs text-gray-500">
            Dica: use <Tag>admin@escola</Tag> / <Tag>123456</Tag> para testar rápido.
          </div>
        </form>
      </Card>
    </div>
  );
}

// ---------------------- Hooks de dados ----------------------
function useTurmas() {
  const [turmas, setTurmas] = useState(() => readLS(LS_KEYS.TURMAS, []));
  useEffect(() => writeLS(LS_KEYS.TURMAS, turmas), [turmas]);
  const add = (t) => setTurmas((x) => [...x, { ...t, id: crypto.randomUUID() }]);
  const update = (id, patch) => setTurmas((x) => x.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  const remove = (id) => setTurmas((x) => x.filter((t) => t.id !== id));
  return { turmas, add, update, remove };
}

function useAlunos() {
  const [alunos, setAlunos] = useState(() => readLS(LS_KEYS.ALUNOS, []));
  useEffect(() => writeLS(LS_KEYS.ALUNOS, alunos), [alunos]);
  const add = (a) => setAlunos((x) => [...x, { ...a, id: crypto.randomUUID() }]);
  const update = (id, patch) => setAlunos((x) => x.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  const remove = (id) => setAlunos((x) => x.filter((a) => a.id !== id));
  return { alunos, add, update, remove };
}

function useForms() {
  const [forms, setForms] = useState(() => readLS(LS_KEYS.FORMS, []));
  const [respostas, setRespostas] = useState(() => readLS(LS_KEYS.RESPOSTAS, []));
  useEffect(() => writeLS(LS_KEYS.FORMS, forms), [forms]);
  useEffect(() => writeLS(LS_KEYS.RESPOSTAS, respostas), [respostas]);
  const addForm = (f) => setForms((x) => [...x, { ...f, id: crypto.randomUUID() }]);
  const updateForm = (id, patch) => setForms((x) => x.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  const removeForm = (id) => setForms((x) => x.filter((f) => f.id !== id));

  const addResposta = (formId, turmaId, alunoId, payload) => {
    setRespostas((x) => [
      ...x,
      { id: crypto.randomUUID(), formId, turmaId, alunoId, payload, data: new Date().toISOString() },
    ]);
  };
  const removeResposta = (id) => setRespostas((x) => x.filter((r) => r.id !== id));

  return { forms, addForm, updateForm, removeForm, respostas, addResposta, removeResposta };
}

// ---------------------- Views ----------------------
function TurmasView() {
  const { turmas, add, update, remove } = useTurmas();
  const [nome, setNome] = useState("");
  const [ano, setAno] = useState("");
  const [turno, setTurno] = useState("Manhã");

  const handleAdd = (e) => {
    e.preventDefault();
    if (!nome.trim()) return;
    add({ nome: nome.trim(), ano: ano || new Date().getFullYear(), turno });
    setNome("");
    setAno("");
  };

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card title="Cadastrar turma">
        <form onSubmit={handleAdd} className="space-y-3">
          <div>
            <label className="text-sm">Nome da turma</label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: 2º ano A" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm">Ano</label>
              <Input value={ano} onChange={(e) => setAno(e.target.value)} placeholder="2025" />
            </div>
            <div>
              <label className="text-sm">Turno</label>
              <select
                className="w-full rounded-xl border border-gray-300 px-3 py-2"
                value={turno}
                onChange={(e) => setTurno(e.target.value)}
              >
                <option>Manhã</option>
                <option>Tarde</option>
                <option>Noite</option>
              </select>
            </div>
          </div>
          <Button className="bg-black text-white" type="submit">Adicionar</Button>
        </form>
      </Card>

      <Card title="Turmas cadastradas" subtitle={`${turmas.length} turma(s)`}>
        <div className="space-y-3">
          {turmas.length === 0 && <div className="text-sm text-gray-500">Nenhuma turma cadastrada ainda.</div>}
          {turmas.map((t) => (
            <div key={t.id} className="flex items-center justify-between gap-3 border rounded-xl p-3">
              <div>
                <div className="font-medium">{t.nome}</div>
                <div className="text-xs text-gray-500">Ano {t.ano} • {t.turno}</div>
              </div>
              <div className="flex gap-2">
                <Button className="bg-white border" onClick={() => {
                  const novoNome = prompt("Novo nome da turma", t.nome);
                  if (novoNome !== null) update(t.id, { nome: novoNome });
                }}>Editar</Button>
                <Button className="bg-red-600 text-white" onClick={() => remove(t.id)}>Excluir</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function AlunosView() {
  const { turmas } = useTurmas();
  const { alunos, add, update, remove } = useAlunos();

  const [nome, setNome] = useState("");
  const [matricula, setMatricula] = useState("");
  const [turmaId, setTurmaId] = useState("");
  const [filtroTurma, setFiltroTurma] = useState("");

  const handleAdd = (e) => {
    e.preventDefault();
    if (!nome.trim() || !turmaId) return;
    add({ nome: nome.trim(), matricula: matricula.trim(), turmaId });
    setNome("");
    setMatricula("");
  };

  const alunosFiltrados = useMemo(() => alunos.filter(a => !filtroTurma || a.turmaId === filtroTurma), [alunos, filtroTurma]);

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card title="Cadastrar aluno">
        <form onSubmit={handleAdd} className="space-y-3">
          <div>
            <label className="text-sm">Nome</label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome completo" />
          </div>
          <div>
            <label className="text-sm">Matrícula (opcional)</label>
            <Input value={matricula} onChange={(e) => setMatricula(e.target.value)} placeholder="00000" />
          </div>
          <div>
            <label className="text-sm">Turma</label>
            <select className="w-full rounded-xl border border-gray-300 px-3 py-2" value={turmaId} onChange={(e) => setTurmaId(e.target.value)} required>
              <option value="">Selecione</option>
              {turmas.map((t) => (
                <option key={t.id} value={t.id}>{t.nome} — {t.ano} ({t.turno})</option>
              ))}
            </select>
          </div>
          <Button className="bg-black text-white" type="submit">Adicionar</Button>
        </form>
      </Card>

      <Card title="Alunos" right={
        <select className="rounded-xl border px-3 py-2" value={filtroTurma} onChange={(e) => setFiltroTurma(e.target.value)}>
          <option value="">Todas as turmas</option>
          {turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
        </select>
      }>
        <div className="space-y-3">
          {alunosFiltrados.length === 0 && <div className="text-sm text-gray-500">Nenhum aluno encontrado.</div>}
          {alunosFiltrados.map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-3 border rounded-xl p-3">
              <div>
                <div className="font-medium">{a.nome}</div>
                <div className="text-xs text-gray-500">Matrícula: {a.matricula || "—"} • Turma: {turmas.find(t=>t.id===a.turmaId)?.nome || "?"}</div>
              </div>
              <div className="flex gap-2">
                <Button className="bg-white border" onClick={() => {
                  const novoNome = prompt("Novo nome", a.nome);
                  if (novoNome !== null) update(a.id, { nome: novoNome });
                }}>Editar</Button>
                <Button className="bg-red-600 text-white" onClick={() => remove(a.id)}>Excluir</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function PerguntaEditor({ p, onChange, onRemove }) {
  return (
    <div className="border rounded-xl p-3 space-y-3">
      <div className="flex items-center justify-between">
        <Tag>Tipo: {p.tipo}</Tag>
        <button className="text-sm text-red-600" onClick={onRemove}>Remover</button>
      </div>
      <div>
        <label className="text-sm">Enunciado</label>
        <Input value={p.enunciado} onChange={(e)=>onChange({ ...p, enunciado: e.target.value })} placeholder="Ex.: Avalie o desempenho do aluno em participação" />
      </div>
      {p.tipo === "multipla" && (
        <div>
          <label className="text-sm">Opções (uma por linha)</label>
          <Textarea
            value={(p.opcoes || []).join("\n")}
            onChange={(e)=>onChange({ ...p, opcoes: e.target.value.split(/\n+/).filter(Boolean) })}
            rows={3}
          />
        </div>
      )}
      {p.tipo === "escala" && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm">Mínimo</label>
            <Input type="number" value={p.min ?? 1} onChange={(e)=>onChange({ ...p, min: Number(e.target.value) })} />
          </div>
          <div>
            <label className="text-sm">Máximo</label>
            <Input type="number" value={p.max ?? 5} onChange={(e)=>onChange({ ...p, max: Number(e.target.value) })} />
          </div>
        </div>
      )}
    </div>
  );
}

function FormBuilderView() {
  const { forms, addForm, updateForm, removeForm, respostas, removeResposta, addResposta } = useForms();
  const { turmas } = useTurmas();
  const { alunos } = useAlunos();

  const [titulo, setTitulo] = useState("Conselho de Classe — Formulário padrão");
  const [descricao, setDescricao] = useState("Use este formulário para registrar percepções, notas e encaminhamentos.");
  const [perguntas, setPerguntas] = useState([]);

  const addPergunta = (tipo) => {
    setPerguntas((x)=>[
      ...x,
      { id: crypto.randomUUID(), tipo, enunciado: "", opcoes: tipo==='multipla'? ["Ótimo","Bom","Regular","Insuficiente"]: undefined, min: tipo==='escala'?1: undefined, max: tipo==='escala'?5: undefined }
    ]);
  };

  const salvarFormulario = () => {
    if (!titulo.trim() || perguntas.length === 0) return alert("Defina título e ao menos 1 pergunta.");
    addForm({ titulo: titulo.trim(), descricao: descricao.trim(), perguntas });
    setPerguntas([]);
    alert("Formulário salvo!");
  };

  const exportar = () => {
    const payload = { turmas, alunos, forms, respostas };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "backup_conselho_classe.json"; a.click();
    URL.revokeObjectURL(url);
  };

  const importar = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = JSON.parse(reader.result);
        if (json.turmas && json.alunos && json.forms && json.respostas) {
          writeLS(LS_KEYS.TURMAS, json.turmas);
          writeLS(LS_KEYS.ALUNOS, json.alunos);
          writeLS(LS_KEYS.FORMS, json.forms);
          writeLS(LS_KEYS.RESPOSTAS, json.respostas);
          alert("Importação concluída. Recarregue a página.");
        } else {
          alert("Arquivo inválido");
        }
      } catch (e) {
        alert("Erro ao importar");
      }
    };
    reader.readAsText(file);
  };

  // Preenchimento/Preview
  const [fillOpen, setFillOpen] = useState(false);
  const [fillFormId, setFillFormId] = useState("");
  const [fillTurmaId, setFillTurmaId] = useState("");
  const [fillAlunoId, setFillAlunoId] = useState("");
  const [fill, setFill] = useState({});

  const selectedForm = useMemo(()=> forms.find(f=>f.id===fillFormId), [forms, fillFormId]);
  const alunosDaTurma = useMemo(()=> alunos.filter(a=>a.turmaId===fillTurmaId), [alunos, fillTurmaId]);

  const submitPreenchimento = () => {
    if (!selectedForm || !fillTurmaId || !fillAlunoId) return alert("Selecione formulário, turma e aluno");
    addResposta(selectedForm.id, fillTurmaId, fillAlunoId, fill);
    setFillOpen(false);
    setFill({});
    alert("Resposta registrada!");
  };

  return (
    <div className="space-y-4">
      <Card title="Novo formulário de Conselho de Classe" subtitle="Construa perguntas personalizadas e salve como modelo.">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <label className="text-sm">Título</label>
              <Input value={titulo} onChange={(e)=>setTitulo(e.target.value)} />
            </div>
            <div>
              <label className="text-sm">Descrição</label>
              <Textarea rows={2} value={descricao} onChange={(e)=>setDescricao(e.target.value)} />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button className="bg-white border" onClick={()=>addPergunta("texto")}>+ Texto curto</Button>
              <Button className="bg-white border" onClick={()=>addPergunta("texto_longo")}>+ Texto longo</Button>
              <Button className="bg-white border" onClick={()=>addPergunta("multipla")}>+ Múltipla escolha</Button>
              <Button className="bg-white border" onClick={()=>addPergunta("escala")}>+ Escala (1-5)</Button>
            </div>
            <div className="space-y-3">
              {perguntas.map((p)=> (
                <PerguntaEditor
                  key={p.id}
                  p={p}
                  onChange={(novo)=> setPerguntas(prev=> prev.map(x=> x.id===p.id? novo: x))}
                  onRemove={()=> setPerguntas(prev=> prev.filter(x=> x.id!==p.id))}
                />
              ))}
              {perguntas.length===0 && <div className="text-sm text-gray-500">Nenhuma pergunta adicionada ainda.</div>}
            </div>
            <div className="flex gap-2">
              <Button className="bg-black text-white" onClick={salvarFormulario}>Salvar formulário</Button>
              <Button className="bg-white border" onClick={exportar}>Exportar backup</Button>
              <label className="bg-white border px-4 py-2 rounded-2xl shadow cursor-pointer">
                Importar JSON
                <input type="file" accept="application/json" className="hidden" onChange={(e)=> e.target.files?.[0] && importar(e.target.files[0])} />
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Formulários salvos</h4>
            <div className="space-y-2">
              {forms.length===0 && <div className="text-sm text-gray-500">Nenhum formulário salvo.</div>}
              {forms.map((f)=> (
                <div key={f.id} className="border rounded-xl p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{f.titulo}</div>
                      <div className="text-xs text-gray-500">{f.perguntas.length} pergunta(s)</div>
                    </div>
                    <div className="flex gap-2">
                      <Button className="bg-white border" onClick={()=>{
                        setTitulo(f.titulo); setDescricao(f.descricao||""); setPerguntas(f.perguntas);
                      }}>Editar</Button>
                      <Button className="bg-red-600 text-white" onClick={()=> removeForm(f.id)}>Excluir</Button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Button className="bg-black text-white" onClick={()=>{ setFillFormId(f.id); setFillOpen(true); }}>Preencher</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card title="Respostas registradas" subtitle={`${respostas.length} resposta(s)`}>
        <div className="space-y-3">
          {respostas.length===0 && <div className="text-sm text-gray-500">Ainda não há respostas.</div>}
          {respostas.map((r)=> {
            const form = forms.find(f=>f.id===r.formId);
            const turma = turmas.find(t=>t.id===r.turmaId);
            const aluno = alunos.find(a=>a.id===r.alunoId);
            return (
              <div key={r.id} className="border rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    <strong>{form?.titulo || "Formulário"}</strong> • {turma?.nome || "Turma"} • {aluno?.nome || "Aluno"}
                    <span className="ml-2 text-xs"><Tag>{new Date(r.data).toLocaleString()}</Tag></span>
                  </div>
                  <Button className="bg-white border" onClick={()=>{
                    const blob = new Blob([JSON.stringify(r, null, 2)], { type: "application/json"});
                    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download=`resposta_${r.id}.json`; a.click(); URL.revokeObjectURL(url);
                  }}>Baixar JSON</Button>
                </div>
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm">Ver respostas</summary>
                  <div className="mt-2 grid gap-2">
                    {Object.entries(r.payload).map(([qid, valor])=>{
                      const p = form?.perguntas.find(pp=>pp.id===qid);
                      return (
                        <div key={qid} className="text-sm">
                          <div className="font-medium">{p?.enunciado || qid}</div>
                          <div className="text-gray-700">{String(valor)}</div>
                        </div>
                      );
                    })}
                  </div>
                </details>
                <div className="mt-2">
                  <Button className="bg-red-600 text-white" onClick={()=>removeResposta(r.id)}>Excluir</Button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {fillOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-5 w-full max-w-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">Preencher: {selectedForm?.titulo}</h3>
                <p className="text-sm text-gray-500">{selectedForm?.descricao}</p>
              </div>
              <button className="text-sm" onClick={()=>setFillOpen(false)}>Fechar</button>
            </div>
            <div className="grid md:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="text-sm">Turma</label>
                <select className="w-full rounded-xl border px-3 py-2" value={fillTurmaId} onChange={(e)=>{ setFillTurmaId(e.target.value); setFillAlunoId(""); }}>
                  <option value="">Selecione</option>
                  {turmas.map(t=> <option key={t.id} value={t.id}>{t.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm">Aluno</label>
                <select className="w-full rounded-xl border px-3 py-2" value={fillAlunoId} onChange={(e)=>setFillAlunoId(e.target.value)}>
                  <option value="">Selecione</option>
                  {alunosDaTurma.map(a=> <option key={a.id} value={a.id}>{a.nome}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-4 space-y-4 max-h-[50vh] overflow-auto pr-1">
              {(selectedForm?.perguntas||[]).map((p)=> (
                <div key={p.id} className="border rounded-xl p-3">
                  <div className="text-sm font-medium mb-2">{p.enunciado || <em className="text-gray-400">(sem enunciado)</em>}</div>
                  {p.tipo === 'texto' && (
                    <Input value={fill[p.id]||''} onChange={(e)=> setFill({...fill, [p.id]: e.target.value})} />
                  )}
                  {p.tipo === 'texto_longo' && (
                    <Textarea rows={4} value={fill[p.id]||''} onChange={(e)=> setFill({...fill, [p.id]: e.target.value})} />
                  )}
                  {p.tipo === 'multipla' && (
                    <div className="grid grid-cols-2 gap-2">
                      {(p.opcoes||[]).map(op => (
                        <label key={op} className="flex items-center gap-2 text-sm">
                          <input type="radio" name={p.id} checked={fill[p.id]===op} onChange={()=> setFill({...fill, [p.id]: op})} /> {op}
                        </label>
                      ))}
                    </div>
                  )}
                  {p.tipo === 'escala' && (
                    <div className="flex items-center gap-2 flex-wrap">
                      {Array.from({ length: (p.max??5) - (p.min??1) + 1 }, (_,i)=> (p.min??1)+i).map(v => (
                        <label key={v} className="flex items-center gap-1 text-sm">
                          <input type="radio" name={p.id} checked={fill[p.id]===v} onChange={()=> setFill({...fill, [p.id]: v})} /> {v}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button className="bg-white border" onClick={()=>{
                window.print();
              }}>Imprimir</Button>
              <Button className="bg-black text-white" onClick={submitPreenchimento}>Enviar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Navbar({ active, setActive, onLogout }) {
  const tabs = [
    { id: "turmas", label: "Turmas" },
    { id: "alunos", label: "Alunos" },
    { id: "formularios", label: "Conselho de Classe" },
  ];
  return (
    <div className="sticky top-0 z-40 bg-white/70 backdrop-blur border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-black" />
          <div className="font-semibold">Sistema Escolar — Conselho de Classe</div>
        </div>
        <div className="flex items-center gap-2">
          {tabs.map(t => (
            <button key={t.id} onClick={()=>setActive(t.id)} className={`px-3 py-2 rounded-full text-sm ${active===t.id? 'bg-black text-white':'hover:bg-gray-100'}`}>
              {t.label}
            </button>
          ))}
          <Button className="bg-white border" onClick={onLogout}>Sair</Button>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ user, logout }) {
  const [active, setActive] = useState("turmas");

  return (

    <div className="min-h-screen bg-gray-50">
      <Navbar active={active} setActive={setActive} onLogout={logout} />
      <main className="max-w-6xl mx-auto p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Bem-vindo(a), {user?.nome || user?.email}</h2>
          <div className="text-xs text-gray-500">Dados salvos localmente (sem servidor)</div>
        </div>
        {active === "turmas" && <TurmasView />}
        {active === "alunos" && <AlunosView />}
        {active === "formularios" && <FormBuilderView />}
      </main>
      <footer className="max-w-6xl mx-auto px-4 pb-6 text-xs text-gray-500">
        Dica: para produção, conecte com uma API (ex.: Node/Express + banco) e habilite perfis/roles (coordenação, professores, etc.).
      </footer>
    </div>
  );
}

export default function App() {
  const auth = useAuth();
  const [ready, setReady] = useState(false);
  useEffect(()=>{ setReady(true); }, []);
  if (!ready) return null;
  if (!auth.user) return <LoginView login={auth.login} register={auth.register} />;
  return <Dashboard user={auth.user} logout={auth.logout} />;
}
