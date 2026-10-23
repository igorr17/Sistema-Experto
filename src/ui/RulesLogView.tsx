import React, { useState } from 'react';
import { LogReglaDisparada } from '../engine/types';
import { Shield, Search, CheckCircle2, AlertTriangle, XCircle, ListFilter } from 'lucide-react';

interface RulesLogViewProps {
  logs: LogReglaDisparada[];
  onBackToResults: () => void;
}

export const RulesLogView: React.FC<RulesLogViewProps> = ({ logs, onBackToResults }) => {
  const [filterType, setFilterType] = useState<string>('todos');
  const [search, setSearch] = useState('');

  const logsFiltrados = logs.filter((log) => {
    const matchFilter = filterType === 'todos' || log.resultado === filterType;
    const matchSearch =
      log.reglaId.toLowerCase().includes(search.toLowerCase()) ||
      log.reglaNombre.toLowerCase().includes(search.toLowerCase()) ||
      log.paisNombre.toLowerCase().includes(search.toLowerCase()) ||
      log.detalle.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-violet-50 text-violet-700 border border-violet-200 flex items-center gap-1">
              <ListFilter className="w-3.5 h-3.5" />
              <span>Trazabilidad del Motor</span>
            </span>
            <span className="text-xs text-slate-500">
              {logs.length} eventos registrados en la sesión actual
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Log de Reglas Disparadas
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Registro cronológico y ordenado de la evaluación de reglas del sistema experto.
          </p>
        </div>

        <button
          onClick={onBackToResults}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          Volver a recomendaciones
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Buscar por regla, país o detalle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none text-xs text-slate-900 bg-white"
          />
        </div>

        <div className="flex gap-2">
          {['todos', 'descartado', 'aviso'].map((tipo) => (
            <button
              key={tipo}
              onClick={() => setFilterType(tipo)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-colors cursor-pointer ${
                filterType === tipo
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tipo === 'todos' ? 'Todos los logs' : tipo}
            </button>
          ))}
        </div>
      </div>

      {/* Log Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4 w-12">#</th>
                <th className="py-3 px-4 w-36">Regla</th>
                <th className="py-3 px-4 w-36">País Afectado</th>
                <th className="py-3 px-4 w-32">Resultado</th>
                <th className="py-3 px-4">Detalle / Motivo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logsFiltrados.map((item, index) => {
                const isDescarte = item.resultado === 'descartado';
                const isAviso = item.resultado === 'aviso';

                return (
                  <tr key={index} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400">{index + 1}</td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{item.reglaId}</span>
                      <span className="text-[11px] text-slate-500 truncate block">
                        {item.reglaNombre}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{item.paisNombre}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          isDescarte
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : isAviso
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {isDescarte && <XCircle className="w-3 h-3" />}
                        {isAviso && <AlertTriangle className="w-3 h-3" />}
                        <span>{item.resultado}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 leading-relaxed font-normal">
                      {item.detalle}
                    </td>
                  </tr>
                );
              })}
              {logsFiltrados.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No hay registros de reglas con los filtros actuales.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
