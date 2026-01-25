import React from "react";
import Button from "./Button";

export default function Navbar({ active, setActive, onLogout, perfil }) {
  const isCoordenador = perfil === "Coordenador";

  const tabs = [
    { id: "comparacao", label: "Painel Central", allow: true },
    { id: "formularios", label: "Conselho de Classe", allow: true },
    { id: "turmas", label: "Turmas", allow: isCoordenador },
    { id: "alunos", label: "Alunos", allow: isCoordenador },
    { id: "usuarios", label: "Usuários", allow: isCoordenador },
  ];

  return (
    <header className="sticky top-0 z-50 bg-ifverde shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* LOGO + IDENTIDADE */}
        <div className="flex items-center gap-3">
          {/* Placeholder do logo IF */}
          <div className="w-10 h-10 rounded bg-white flex items-center justify-center font-bold text-ifverde text-sm">
            IF
          </div>

          <div className="hidden sm:block text-white leading-tight">
            <div className="font-semibold">Instituto Federal</div>
            <div className="text-xs opacity-80">Conselho de Classe</div>
          </div>
        </div>

        {/* MENU */}
        <nav className="flex items-center gap-2 overflow-x-auto">
          {tabs
            .filter((tab) => tab.allow)
            .map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                className={`px-3 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${
                  active === tab.id
                    ? "bg-ifvermelho text-white"
                    : "text-white hover:bg-ifverdeclaro"
                }`}
              >
                {tab.label}
              </button>
            ))}

          {/* BOTÃO SAIR */}
          <Button
            className="ml-2 bg-white text-ifverde border border-white hover:bg-gray-100 text-sm"
            onClick={onLogout}
          >
            Sair
          </Button>
        </nav>
      </div>
    </header>
  );
}
