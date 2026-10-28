import React, { useState } from 'react';
import { LogReglaDisparada } from '../engine/types';
import { Regla } from '../data/types';
import {
  Shield,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ListFilter,
  Plus,
  BookOpen,
  Sliders,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface RulesLogViewProps {
  logs: LogReglaDisparada[];
  reglasSeguidas: LogReglaDisparada[];
  todasLasReglas: Regla[];
  onBackToResults: () => void;
  onOpenAddRule: () => void;
  onToggleRule: (reglaId: string, activa: boolean) => void;
  onDeleteRule?: (reglaId: string) => void;
}

export const RulesLogView: React.FC<RulesLogViewProps> = ({
  logs,
  reglasSeguidas,
  todasLasReglas,
  onBackToResults,
  onOpenAddRule,
  onToggleRule,
  onDeleteRule,
}) => {
  // Pestaña activa: por defecto 'seguidas' (que se vean las reglas que SÍ sigue el proceso)
  const [tabActiva, setTabActiva] = useState<'seguidas' | 'base_conocimiento' | 'descartes'>('seguidas');
  const [search, setSearch] = useState('');
  const [filtroPaso, setFiltroPaso] = useState<string>('todos');

  // Filtrado para Reglas Seguidas
  const reglasSeguidasFiltradas = reglasSeguidas.filter((item) => {
    const matchSearch =
      item.reglaId.toLowerCase().includes(search.toLowerCase()) ||
      item.reglaNombre.toLowerCase().includes(search.toLowerCase()) ||
      item.paisNombre.toLowerCase().includes(search.toLowerCase()) ||
      item.detalle.toLowerCase().includes(search.toLowerCase());

    const matchPaso = filtroPaso === 'todos' || item.paso === filtroPaso;
    return matchSearch && matchPaso;
  });

  // Filtrado para Base de Conocimiento de Reglas
  const baseReglasFiltradas = todasLasReglas.filter((r) => {
    const matchSearch =
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.nombre.toLowerCase().includes(search.toLowerCase()) ||
      (r.descripcion && r.descripcion.toLowerCase().includes(search.toLowerCase())) ||
      (r.tipo && r.tipo.toLowerCase().includes(search.toLowerCase()));
    return matchSearch;
  });

  // Filtrado para Historial de descartes (las que no)
  const descartes = logs.filter((l) => l.resultado === 'descartado');
  const descartesFiltrados = descartes.filter((item) => {
    return (
      item.reglaId.toLowerCase().includes(search.toLowerCase()) ||
      item.reglaNombre.toLowerCase().includes(search.toLowerCase()) ||
      item.paisNombre.toLowerCase().includes(search.toLowerCase()) ||
      item.detalle.toLowerCase().includes(search.toLowerCase())
    );
  });

  // Lista de pasos únicos disponibles en las reglas seguidas
  const pasosDisponibles = Array.from(
    new Set(reglasSeguidas.map((r) => r.paso).filter(Boolean))
  ) as string[];

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Motor de Inferencia del Sistema Experto</span>
            </span>
            <span className="text-xs text-slate-500">
              {reglasSeguidas.length} reglas satisfechas en el razonamiento actual
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Trazabilidad y Gestor de Reglas
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Visualización de la cadena de razonamiento (reglas que sí se siguen) y administración de la base de conocimiento.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {/* Botón "+ Añadir nueva regla" */}
          <button
            onClick={onOpenAddRule}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Añadir nueva regla</span>
          </button>

          <button
            onClick={onBackToResults}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            Volver a recomendaciones
          </button>
        </div>
      </div>

      {/* Tabs Principales */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => {
            setTabActiva('seguidas');
            setFiltroPaso('todos');
          }}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            tabActiva === 'seguidas'
              ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-200'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Reglas que SÍ sigue el proceso ({reglasSeguidas.length})</span>
        </button>

        <button
          onClick={() => {
            setTabActiva('base_conocimiento');
            setFiltroPaso('todos');
          }}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            tabActiva === 'base_conocimiento'
              ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-200'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Base de Conocimiento de Reglas ({todasLasReglas.length})</span>
        </button>

        <button
          onClick={() => {
            setTabActiva('descartes');
            setFiltroPaso('todos');
          }}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            tabActiva === 'descartes'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <XCircle className="w-4 h-4" />
          <span>Historial de descartes / Filtros ({descartes.length})</span>
        </button>
      </div>

      {/* Controls: Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder={
              tabActiva === 'seguidas'
                ? 'Buscar regla seguida, paso, país o detalle...'
                : tabActiva === 'base_conocimiento'
                ? 'Buscar por ID de regla, nombre o tipo...'
                : 'Buscar país o filtro descartado...'
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none text-xs text-slate-900 bg-white"
          />
        </div>

        {tabActiva === 'seguidas' && pasosDisponibles.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setFiltroPaso('todos')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                filtroPaso === 'todos'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Todos los pasos
            </button>
            {pasosDisponibles.map((p) => (
              <button
                key={p}
                onClick={() => setFiltroPaso(p)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  filtroPaso === p
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* CONTENIDO DE PESTAÑA 1: REGLAS QUE SÍ SIGUE EL PROCESO */}
      {tabActiva === 'seguidas' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>
                <strong>Cadena de Inferencia Exitosa:</strong> Mostrando exclusivamente las reglas que el motor de inferencia ejecutó, validó y cumplió para fundamentar la recomendación actual.
              </span>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
              {reglasSeguidasFiltradas.length} reglas activas
            </span>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4 w-12">#</th>
                    <th className="py-3 px-4 w-36">Paso del Proceso</th>
                    <th className="py-3 px-4 w-40">Regla Evaluada</th>
                    <th className="py-3 px-4 w-36">Ámbito / Destino</th>
                    <th className="py-3 px-4 w-32">Estado</th>
                    <th className="py-3 px-4">Justificación / Detalle de Inferencia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reglasSeguidasFiltradas.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-slate-400">{index + 1}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[11px]">
                          {item.paso || 'Inferencia'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="font-extrabold text-slate-900 font-mono">
                            {item.reglaId}
                          </span>
                          {item.tipo === 'personalizada' && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] bg-purple-100 text-purple-700 font-bold">
                              Cliente
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 block truncate max-w-xs">
                          {item.reglaNombre}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {item.paisNombre}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Satisfecha</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 leading-relaxed font-normal">
                        {item.detalle}
                      </td>
                    </tr>
                  ))}
                  {reglasSeguidasFiltradas.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-400">
                        No se encontraron reglas seguidas con el filtro de búsqueda actual.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CONTENIDO DE PESTAÑA 2: BASE DE CONOCIMIENTO DE REGLAS */}
      {tabActiva === 'base_conocimiento' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200 text-indigo-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="font-bold text-sm mb-0.5">Gestor de Base de Conocimiento</p>
              <p className="text-slate-600">
                Puedes activar/desactivar reglas o añadir nuevas condiciones personalizadas con el botón superior.
              </p>
            </div>
            <button
              onClick={onOpenAddRule}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir regla</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {baseReglasFiltradas.map((r) => {
              const esPersonalizada = !!r.esPersonalizada;
              const estaActiva = r.activa !== false;

              return (
                <div
                  key={r.id}
                  className={`p-5 rounded-3xl border transition-all bg-white shadow-xs flex flex-col justify-between ${
                    estaActiva
                      ? 'border-slate-200 hover:border-indigo-300'
                      : 'border-slate-200 bg-slate-50/60 opacity-60'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono font-black text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-800">
                            {r.id}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              r.tipo === 'filtro' || r.tipo === 'filtro_por_criterio'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : r.tipo === 'puntuacion'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : r.tipo === 'conflicto'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-violet-50 text-violet-700 border border-violet-200'
                            }`}
                          >
                            {r.tipo}
                          </span>
                          {esPersonalizada && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                              Creada por cliente
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 leading-tight">
                          {r.nombre}
                        </h4>
                      </div>

                      {/* Toggle Activa/Inactiva */}
                      <button
                        onClick={() => onToggleRule(r.id, !estaActiva)}
                        className="text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                        title={estaActiva ? 'Desactivar regla' : 'Activar regla'}
                      >
                        {estaActiva ? (
                          <ToggleRight className="w-6 h-6 text-indigo-600" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-slate-400" />
                        )}
                      </button>
                    </div>

                    {r.descripcion && (
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {r.descripcion}
                      </p>
                    )}

                    {/* Condiciones SI... */}
                    {r.si && r.si.length > 0 && (
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 text-xs font-mono">
                        <span className="font-sans text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Condiciones SI:
                        </span>
                        {r.si.map((cond, idx) => (
                          <div key={idx} className="text-slate-700 flex items-center gap-1.5">
                            <span className="text-indigo-600 font-bold">{idx === 0 ? 'SI' : 'Y'}</span>
                            <span className="font-semibold">{String(cond.izq)}</span>
                            <span className="text-rose-600 font-bold">{cond.op}</span>
                            <span className="font-semibold">{String(cond.der)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Consecuencia ENTONCES... */}
                    {r.entonces && (
                      <div className="text-xs text-slate-600">
                        <strong className="text-slate-800">Acción: </strong>
                        <span className="capitalize">{r.entonces.accion}</span>
                        {(r.entonces.motivo || r.entonces.mensaje) && (
                          <span className="italic block mt-0.5 text-slate-500">
                            &ldquo;{r.entonces.motivo || r.entonces.mensaje}&rdquo;
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {esPersonalizada && onDeleteRule && (
                    <div className="pt-3 mt-3 border-t border-slate-100 flex justify-end">
                      <button
                        onClick={() => onDeleteRule(r.id)}
                        className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Eliminar regla</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CONTENIDO DE PESTAÑA 3: HISTORIAL DE DESCARTES (LAS QUE NO) */}
      {tabActiva === 'descartes' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              <strong>Historial de Evaluaciones Negativas:</strong> Destinos que incumplieron uno o más filtros eliminatorios durante el filtrado inicial.
            </span>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4 w-12">#</th>
                    <th className="py-3 px-4 w-36">Regla de Filtro</th>
                    <th className="py-3 px-4 w-36">País Afectado</th>
                    <th className="py-3 px-4 w-32">Resultado</th>
                    <th className="py-3 px-4">Motivo / Criterio Incumplido</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {descartesFiltrados.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-400">{index + 1}</td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block font-mono">{item.reglaId}</span>
                        <span className="text-[11px] text-slate-500 truncate block">
                          {item.reglaNombre}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{item.paisNombre}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle className="w-3 h-3" />
                          <span>Descartado</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 leading-relaxed font-normal">
                        {item.detalle}
                      </td>
                    </tr>
                  ))}
                  {descartesFiltrados.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No hay registros de descarte con la búsqueda actual.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
