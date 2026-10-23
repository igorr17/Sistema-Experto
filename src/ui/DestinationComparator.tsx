import React from 'react';
import { PaisEvaluado } from '../engine/types';
import { ClimateChart } from './ClimateChart';
import { QualityBadge } from './QualityBadge';
import { X, Award, CheckCircle2, AlertTriangle, ArrowRight, Shield, Plane, Euro, Sparkles } from 'lucide-react';

interface DestinationComparatorProps {
  destinos: PaisEvaluado[];
  mesSeleccionado?: number;
  onRemoveDestino: (id: number) => void;
  onClose: () => void;
}

export const DestinationComparator: React.FC<DestinationComparatorProps> = ({
  destinos,
  mesSeleccionado,
  onRemoveDestino,
  onClose,
}) => {
  if (destinos.length === 0) return null;

  const criteriosList = [
    { id: 'playa', label: 'Playa y costa' },
    { id: 'cultura', label: 'Cultura y patrimonio' },
    { id: 'naturaleza', label: 'Naturaleza' },
    { id: 'gastronomia', label: 'Gastronomía' },
    { id: 'precio', label: 'Económico' },
    { id: 'seguridad', label: 'Seguridad' },
    { id: 'ingles', label: 'Nivel inglés' },
    { id: 'clima', label: 'Clima y confort' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Comparador Cara a Cara ({destinos.length} destinos)
              </h3>
              <p className="text-xs text-slate-500">
                Analiza las ventajas y diferencias clave para tomar tu decisión final.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Comparison Table / Grid */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Tarjetas de Encabezado de los Países Comparados */}
          <div className={`grid gap-4 ${destinos.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {destinos.map((p, idx) => (
              <div
                key={p.pais.id}
                className="p-4 rounded-2xl border-2 border-indigo-200 bg-indigo-50/40 flex flex-col justify-between relative shadow-xs"
              >
                <button
                  onClick={() => onRemoveDestino(p.pais.id)}
                  className="absolute top-2 right-2 text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-white transition-colors cursor-pointer"
                  title="Quitar de la comparativa"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                <div>
                  <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">
                    Opción #{idx + 1}
                  </span>
                  <h4 className="text-xl font-black text-slate-900">{p.pais.nombre}</h4>
                  <span className="text-xs text-slate-500">{p.pais.subzona}</span>
                </div>

                <div className="mt-3 flex items-baseline justify-between pt-2 border-t border-indigo-100">
                  <span className="text-xs text-slate-600 font-medium">Afinidad global:</span>
                  <span className="text-xl font-black text-indigo-700">
                    {p.compatibilidad !== null ? `${p.compatibilidad}%` : '—'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Tabla Comparativa de Indicadores Clave */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 w-44">Indicador</th>
                  {destinos.map((p) => (
                    <th key={p.pais.id} className="py-3 px-4 font-bold text-slate-800">
                      {p.pais.nombre}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* Coste diario */}
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-semibold text-slate-700 flex items-center gap-1.5">
                    <Euro className="w-3.5 h-3.5 text-slate-400" />
                    <span>Coste diario estimado</span>
                  </td>
                  {destinos.map((p) => (
                    <td key={p.pais.id} className="py-3 px-4 font-bold text-slate-900">
                      {p.pais.atributos.coste_diario?.valor !== 'SIN DATO'
                        ? `${p.pais.atributos.coste_diario?.valor} € / día`
                        : 'SIN DATO'}
                    </td>
                  ))}
                </tr>

                {/* Horas vuelo */}
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-semibold text-slate-700 flex items-center gap-1.5">
                    <Plane className="w-3.5 h-3.5 text-slate-400" />
                    <span>Vuelo directo desde Madrid</span>
                  </td>
                  {destinos.map((p) => (
                    <td key={p.pais.id} className="py-3 px-4 font-bold text-slate-900">
                      {p.pais.atributos.horas_vuelo?.valor} horas
                    </td>
                  ))}
                </tr>

                {/* Seguridad */}
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-semibold text-slate-700 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-slate-400" />
                    <span>Seguridad ciudadana</span>
                  </td>
                  {destinos.map((p) => {
                    const seg = String(p.pais.atributos.seguridad?.valor);
                    return (
                      <td key={p.pais.id} className="py-3 px-4 font-bold">
                        <span
                          className={`px-2 py-0.5 rounded-md ${
                            seg === 'Bajo riesgo'
                              ? 'bg-emerald-50 text-emerald-700'
                              : seg === 'Riesgo medio'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {seg}
                        </span>
                      </td>
                    );
                  })}
                </tr>

                {/* Entrada / Visados */}
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-semibold text-slate-700">Requisitos de entrada</td>
                  {destinos.map((p) => (
                    <td key={p.pais.id} className="py-3 px-4 text-slate-800">
                      {String(p.pais.atributos.entrada_espanoles?.valor)}
                    </td>
                  ))}
                </tr>

                {/* Ajuste de restricciones / Márgenes */}
                <tr className="hover:bg-slate-50/50 bg-amber-50/20">
                  <td className="py-3 px-4 font-bold text-amber-900">
                    Ajuste de restricciones
                  </td>
                  {destinos.map((p) => (
                    <td key={p.pais.id} className="py-3 px-4">
                      {p.reglasIncumplidas.length > 0 ? (
                        <div className="space-y-1">
                          {p.reglasIncumplidas.map((r, i) => (
                            <div key={i} className="text-amber-800 font-medium text-[11px]">
                              ⚠️ <strong>{r.reglaNombre}:</strong> {r.margen}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Cumple 100% de tus condiciones</span>
                        </span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Criterios de Afinidad (1 a 5) */}
                {criteriosList.map((crit) => (
                  <tr key={crit.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-4 font-semibold text-slate-600 capitalize">
                      {crit.label}
                    </td>
                    {destinos.map((p) => {
                      const af = p.pais.afinidad[crit.id] ?? 3;
                      return (
                        <td key={p.pais.id} className="py-2.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900">{af}/5</span>
                            <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-indigo-600 h-full rounded-full"
                                style={{ width: `${(af / 5) * 100}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Gráfico Climático Comparado */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Comparativa Climática Anual
            </h5>
            <div className={`grid gap-4 ${destinos.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3'}`}>
              {destinos.map((p) => (
                <div key={p.pais.id} className="space-y-1">
                  <span className="text-xs font-bold text-slate-900 block">{p.pais.nombre}</span>
                  <ClimateChart
                    clima={p.pais.clima}
                    mesSeleccionado={mesSeleccionado}
                    paisNombre={p.pais.nombre}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            Cerrar comparativa
          </button>
        </div>
      </div>
    </div>
  );
};
