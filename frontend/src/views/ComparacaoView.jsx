import React, { useEffect, useState } from "react";
import Card from "../components/Card";

export default function ComparacaoView() {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Busca os dados consolidados do Python
    fetch("http://127.0.0.1:5000/api/dashboard/resumo")
      .then((res) => res.json())
      .then((data) => {
        setDados(data);
        setLoading(false);
      })
      .catch((err) => console.error("Erro ao carregar dashboard:", err));
  }, []);

  if (loading) return <div className="p-4 text-gray-500">Carregando dados...</div>;
  if (!dados) return <div className="p-4 text-red-500">Erro ao carregar dados.</div>;

  // Calcula o maior valor para fazer a escala do gráfico (regra de 3 simples)
  const maiorContagem = Math.max(
    ...dados.alunos_por_turno.map((t) => t.count),
    1 // Evita divisão por zero
  );

  return (
    <div className="space-y-6">
      {/* 1. Cards de Resumo (Topo) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-black text-white p-5 rounded-2xl shadow">
          <div className="text-3xl font-bold">{dados.total_alunos}</div>
          <div className="text-sm opacity-80">Total de Alunos</div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow border">
          <div className="text-3xl font-bold">{dados.total_turmas}</div>
          <div className="text-sm text-gray-500">Turmas Cadastradas</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* 2. Gráfico de Alunos por Turno */}
        <Card title="Distribuição por Turno" subtitle="Quantidade de alunos matriculados">
          <div className="space-y-4 mt-2">
            {dados.alunos_por_turno.length === 0 && (
               <div className="text-gray-400 text-sm">Sem dados de alunos.</div>
            )}
            {dados.alunos_por_turno.map((item) => {
              // Calcula a porcentagem da barra
              const porcentagem = (item.count / maiorContagem) * 100;
              return (
                <div key={item.turno}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{item.turno || "Sem turno"}</span>
                    <span className="text-gray-500">{item.count} alunos</span>
                  </div>
                  {/* A barra do gráfico feita com CSS */}
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-black h-3 rounded-full transition-all duration-500"
                      style={{ width: `${porcentagem}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* 3. Tabela Comparativa (Placeholder para futuro) */}
        <Card title="Comparativo Rápido" subtitle="Métricas gerais">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-gray-500 border-b">
                        <tr>
                            <th className="py-2">Métrica</th>
                            <th className="py-2 text-right">Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b last:border-0">
                            <td className="py-3">Média de alunos/turma</td>
                            <td className="py-3 text-right font-medium">
                                {dados.total_turmas > 0 
                                  ? (dados.total_alunos / dados.total_turmas).toFixed(1) 
                                  : "0"}
                            </td>
                        </tr>
                        <tr className="border-b last:border-0">
                            <td className="py-3">Turno com mais alunos</td>
                            <td className="py-3 text-right font-medium">
                                {dados.alunos_por_turno.sort((a,b) => b.count - a.count)[0]?.turno || "-"}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </Card>
      </div>
    </div>
  );
}