import React from "react";
import Input from "./Input";
import Textarea from "./Textarea";
import Tag from "./Tag";

export default function PerguntaEditor({ p, onChange, onRemove }) {
  return (
    <div className="border rounded-xl p-3 space-y-3">
      <div className="flex items-center justify-between">
        <Tag>Tipo: {p.tipo}</Tag>
        <button className="text-sm text-red-600" onClick={onRemove}>
          Remover
        </button>
      </div>
      <div>
        <label className="text-sm">Enunciado</label>
        <Input
          value={p.enunciado}
          onChange={(e) => onChange({ ...p, enunciado: e.target.value })}
          placeholder="Ex.: Avalie o desempenho do aluno em participação"
        />
      </div>
      {p.tipo === "multipla" && (
        <div>
          <label className="text-sm">Opções (uma por linha)</label>
          <Textarea
            value={(p.opcoes || []).join("\n")}
            onChange={(e) =>
              onChange({ ...p, opcoes: e.target.value.split(/\n+/).filter(Boolean) })
            }
            rows={3}
          />
        </div>
      )}
      {p.tipo === "escala" && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm">Mínimo</label>
            <Input
              type="number"
              value={p.min ?? 1}
              onChange={(e) => onChange({ ...p, min: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="text-sm">Máximo</label>
            <Input
              type="number"
              value={p.max ?? 5}
              onChange={(e) => onChange({ ...p, max: Number(e.target.value) })}
            />
          </div>
        </div>
      )}
    </div>
  );
}