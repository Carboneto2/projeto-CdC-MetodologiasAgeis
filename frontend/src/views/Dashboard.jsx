import React, { useState } from "react";
// Importe as outras views e o Navbar
import Navbar from "../components/Navbar"; // (Crie este componente também!)
import TurmasView from "./TurmasView";       // (Crie esta view!)
import AlunosView from "./AlunosView";       // (Crie esta view!)
import FormBuilderView from "./FormBuilderView"; // (Crie esta view!)

export default function Dashboard({ user, logout }) {
  const [active, setActive] = useState("turmas");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar active={active} setActive={setActive} onLogout={logout} />
      <main className="max-w-6xl mx-auto p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Bem-vindo(a), {user?.nome || user?.email}</h2>
          <div className="text-xs text-gray-500">Dados salvos localmente (sem servidor)</div>
        </div>
        
        {/* Aqui é onde a mágica acontece */}
        {active === "turmas" && <TurmasView />}
        {active === "alunos" && <AlunosView />}
        {active === "formularios" && <FormBuilderView />}
        
      </main>
      <footer className="max-w-6xl mx-auto px-4 pb-6 text-xs text-gray-500">
        Dica: para produção, conecte com uma API...
      </footer>
    </div>
  );
}