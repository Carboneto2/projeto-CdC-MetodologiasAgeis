import React, { useState } from "react";
import Navbar from "../components/Navbar";
import TurmasView from "./TurmasView";
import AlunosView from "./AlunosView";
import FormBuilderView from "./FormBuilderView";
import ComparacaoView from "./ComparacaoView";
import UsuariosView from "./UsuariosView";

export default function Dashboard({ user, logout }) {
  const [active, setActive] = useState("comparacao");

  const isCoordenador = user?.perfil === "Coordenador";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        active={active}
        setActive={setActive}
        onLogout={logout}
        perfil={user?.perfil}
      />

      <main className="max-w-6xl mx-auto p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Bem-vindo(a), {user?.email}
          </h2>
          <div className="text-xs text-gray-500">
            Perfil: {user?.perfil}
          </div>
        </div>

        {/* ================= PAINEL CENTRAL ================= */}
        {active === "comparacao" && <ComparacaoView />}

        {/* ================= CONSELHO DE CLASSE ================= */}
        {/* VISÍVEL PARA PROFESSOR E COORDENADOR */}
        {active === "formularios" && (
          <FormBuilderView key={user?.perfil} user={user} />
        )}

        {/* ================= TELAS EXCLUSIVAS DO COORDENADOR ================= */}
        {isCoordenador && active === "turmas" && <TurmasView />}
        {isCoordenador && active === "alunos" && <AlunosView />}
        {isCoordenador && active === "usuarios" && <UsuariosView />}

        {/* ================= BLOQUEIO VISUAL ================= */}
        {!isCoordenador &&
          ["turmas", "alunos", "usuarios"].includes(active) && (
            <div className="p-4 bg-red-100 text-red-700 rounded">
              Acesso restrito ao coordenador.
            </div>
          )}
      </main>

      <footer className="max-w-6xl mx-auto px-4 pb-6 text-xs text-gray-500 text-center">
        Sistema de Conselho de Classe - Versão Local
      </footer>
    </div>
  );
}
