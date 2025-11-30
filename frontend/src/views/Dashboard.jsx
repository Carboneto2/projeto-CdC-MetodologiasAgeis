import React, { useState } from "react";
import Navbar from "../components/Navbar";
import TurmasView from "./TurmasView";
import AlunosView from "./AlunosView";
import FormBuilderView from "./FormBuilderView";
import ComparacaoView from "./ComparacaoView";

export default function Dashboard({ user, logout }) {
  const [active, setActive] = useState("visao_geral"); 
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar active={active} setActive={setActive} onLogout={logout} />
      <main className="max-w-6xl mx-auto p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Bem-vindo(a), {user?.nome || user?.email}
          </h2>
          <div className="text-xs text-gray-500">
            Dados salvos localmente (sem servidor)
          </div>
        </div>
            {active === "visao_geral" && <ComparacaoView />}  {/* <--- ADICIONAR ISSO */}
            {active === "turmas" && <TurmasView />}
            {active === "alunos" && <AlunosView />}
            {active === "formularios" && <FormBuilderView />}
      </main>
      <footer className="max-w-6xl mx-auto px-4 pb-6 text-xs text-gray-500">
        Dica: para produção, conecte com uma API (ex.: Node/Express + banco) e
        habilite perfis/roles (coordenação, professores, etc.).
      </footer>
    </div>
  );
}