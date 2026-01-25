import React, { useContext } from "react";
import { AuthContext } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
//import './DashboardView.css'; // Certifique-se de que o CSS existe (criamos nos passos anteriores)

export function Dashboard() {
  const { user } = useContext(AuthContext);

  // Dados fictícios para os gráficos (Task 3.5)
  const dadosGrafico = [
    { nome: '1º Info', media: 8.5, ocorrencias: 2 },
    { nome: '2º Agro', media: 6.2, ocorrencias: 8 },
    { nome: '3º Meio Amb', media: 7.8, ocorrencias: 4 },
    { nome: '1º Agro', media: 5.5, ocorrencias: 12 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* A Navbar já está no App.jsx, não precisamos chamar ela aqui */}

      <main className="max-w-6xl mx-auto space-y-6">
        
        {/* SEU CABEÇALHO ORIGINAL */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Bem-vindo(a), {user?.nome || 'Usuário'}
            </h2>
            <p className="text-gray-500">Visão Geral do Conselho de Classe</p>
          </div>
          <div className="text-xs text-gray-500 bg-white p-2 rounded border">
             Ambiente Seguro
          </div>
        </div>

        {/* --- CARDS DE KPI (INDICADORES) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-red-500">
                <h3 className="text-gray-500 text-sm font-medium">Alunos em Risco</h3>
                <span className="text-3xl font-bold text-gray-800">15</span>
                <p className="text-xs text-red-500 mt-1">Notas abaixo de 60%</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
                <h3 className="text-gray-500 text-sm font-medium">Total de Turmas</h3>
                <span className="text-3xl font-bold text-gray-800">4</span>
                <p className="text-xs text-gray-400 mt-1">Analisadas neste ciclo</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
                <h3 className="text-gray-500 text-sm font-medium">Média Geral</h3>
                <span className="text-3xl font-bold text-gray-800">7.2</span>
                <p className="text-xs text-green-600 mt-1">Acima da meta</p>
            </div>
        </div>

        {/* --- GRÁFICO --- */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Desempenho por Turma</h3>
            <div style={{ width: '100%', height: 350 }}>
                <ResponsiveContainer>
                    <BarChart data={dadosGrafico}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="nome" />
                        <YAxis />
                        <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                        />
                        <Legend />
                        <Bar dataKey="media" fill="#2E7D32" name="Média" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="ocorrencias" fill="#C62828" name="Ocorrências" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

      </main>

      {/* SEU FOOTER ORIGINAL */}
      <footer className="max-w-6xl mx-auto px-4 py-8 text-xs text-gray-500 text-center mt-8 border-t">
        Sistema de Conselho de Classe - Versão Local
      </footer>
    </div>
  );
}