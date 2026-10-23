import React, { useState, useMemo } from 'react';
import { DescartePais } from '../engine/types';
import { QualityBadge } from './QualityBadge';
import { Search, Filter, Ban, AlertCircle, ChevronDown } from 'lucide-react';

interface DiscardedCountriesViewProps {
  descartados: DescartePais[];
  onBackToResults: () => void;
}

export const DiscardedCountriesView: React.FC<DiscardedCountriesViewProps> = ({
  descartados,
  onBackToResults,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRuleFilter, setSelectedRuleFilter] = useState<string>('todas');

  // Obtener lista única de reglas que provocaron descartes
  const reglasDisponibles = useMemo(() => {
    const map = new Map<string, string>();
    descartados.forEach((d) => {
      d.motivos.forEach((m) => {
        if (!map.has(m.reglaId)) {
          map.set(m.reglaId, m.reglaNombre);
        }
      });
    });
    return Array.from(map.entries()).map(([id, nombre]) => ({ id, nombre }));
  }, [descartados]);

  // Filtrado por buscador y regla
  const descartadosFiltrados = useMemo(() => {
    return descartados.filter((d) => {
      const matchSearch =
        d.pais.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.pais.zona.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.pais.subzona.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.motivos.some((m) => m.motivo.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchRule =
        selectedRuleFilter === 'todas' ||
        d.motivos.some((m) => m.reglaId === selectedRuleFilter);

      return matchSearch && matchRule;
    });
  }, [descartados, searchTerm, selectedRuleFilter]);

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
              <Ban className="w-3.5 h-3.5" />
              <span>Descartes del Motor</span>
            </span>
            <span className="text-xs text-slate-500">
              {descartados.length} países no cumplen los filtros
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Países Descartados y Motivos
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Revisa detalladamente por qué cada país fue descartado por los filtros eliminatorios y las fuentes oficiales que lo sustentan.
          </p>
        </div>

        <button
          onClick={onBackToResults}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          Volver a recomendaciones
        </button>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Buscar país, zona o motivo de descarte..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none text-xs text-slate-900 bg-white"
          />
        </div>

        <div className="sm:w-72 relative">
          <select
            value={selectedRuleFilter}
            onChange={(e) => setSelectedRuleFilter(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none text-xs text-slate-900 bg-white appearance-none cursor-pointer"
          >
            <option value="todas">Todas las reglas eliminatorias</option>
            {reglasDisponibles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.id}: {r.nombre}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
        </div>
      </div>

      {/* Grid of Discarded Countries */}
      {descartadosFiltrados.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
          <h4 className="text-base font-bold text-slate-700">No se encontraron países</h4>
          <p className="text-xs text-slate-500">
            Prueba a cambiar el término de búsqueda o el filtro de regla seleccionado.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {descartadosFiltrados.map((d) => (
            <div
              key={d.pais.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">{d.pais.nombre}</h4>
                    <span className="text-xs text-slate-500 font-medium">
                      {d.pais.zona} • {d.pais.subzona}
                    </span>
                  </div>

                  <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold">
                    {d.motivos.length} regla{d.motivos.length > 1 ? 's' : ''} disparada{d.motivos.length > 1 ? 's' : ''}
                  </span>
                </div>

                {/* Motivos de descarte */}
                <div className="space-y-2.5 mb-4">
                  {d.motivos.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        <span>Regla {m.reglaId}: {m.reglaNombre}</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed font-normal">
                        {m.motivo}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Indicadores clave con fuente */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <span>
                  Coste: {d.pais.atributos.coste_diario?.valor !== 'SIN DATO' ? `${d.pais.atributos.coste_diario?.valor} €` : 'N/D'}
                </span>
                <span>•</span>
                <span>Vuelo: {d.pais.atributos.horas_vuelo?.valor} h</span>
                <span>•</span>
                <span>Seguridad: {d.pais.atributos.seguridad?.valor}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
