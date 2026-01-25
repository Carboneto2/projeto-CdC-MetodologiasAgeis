import React from "react";
import Button from "./Button";

export default function Navbar({ active, setActive, onLogout }) {
  const tabs = [
    { id: "comparacao", label: "Painel Central" }, // Agora é o primeiro e com novo nome
    { id: "turmas", label: "Turmas" },
    { id: "alunos", label: "Alunos" },
    { id: "formularios", label: "Conselho de Classe" },
  ];
  
  return (
    <div className="sticky top-0 z-40 bg-white/70 backdrop-blur border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-black" />
          <div className="font-semibold hidden sm:block">Sistema Escolar</div>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={`px-3 py-2 rounded-full text-sm whitespace-nowrap transition ${
                active === t.id ? "bg-black text-white" : "hover:bg-gray-100"
              }`}
            >
              {t.label}
            </button>
          ))}
          <Button className="bg-white border text-sm" onClick={onLogout}>
            Sair
          </Button>
        </div>
      </div>
    </div>
  );
}