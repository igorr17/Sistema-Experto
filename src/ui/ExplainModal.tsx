import React from 'react';
import { ExplicacionCompletaPais } from '../explain/explainer';
import { QualityBadge } from './QualityBadge';
import { ClimateChart } from './ClimateChart';
import { X, CheckCircle2, ShieldCheck, Award, Info, MapPin, AlertTriangle, Sun } from 'lucide-react';

interface ExplainModalProps {
  explicacion: ExplicacionCompletaPais | null;
  mesSeleccionado?: number;
  onClose: () => void;
}

export const ExplainModal: React.FC<ExplainModalProps> = ({ explicacion, mesSeleccionado, onClose }) => {
  if (!explicacion) return null;

  const { pais, compatibilidad, ranking, criterios, reglasSuperadas, atributosPrincipales } =
    explicacion;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
              #{ranking}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900">{pais.nombre}</h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  {pais.subzona}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Compatibilidad global:{' '}
                {compatibilidad !== null ? (
                  <strong className="text-indigo-600 font-bold">{compatibilidad}%</strong>
                ) : (
                  <span className="italic">Sin ponderación de preferencias</span>
                )}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Reglas Incumplidas / Margen */}
          {explicacion.reglasIncumplidas && explicacion.reglasIncumplidas.length > 0 ? (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 shadow-xs">
              <div className="flex items-center gap-2 mb-1.5 text-amber-900 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>
                  {explicacion.esAjusteAproximado ? 'Los que más se ajustan' : 'Condiciones no cumplidas'} ({explicacion.reglasIncumplidas.length})
                </span>
              </div>
              <p className="text-xs text-amber-800 mb-3 leading-relaxed">
                Este destino tiene una afinidad destacada pero no cumple las siguientes reglas de filtro:
              </p>
              <div className="space-y-2">
                {explicacion.reglasIncumplidas.map((r, i) => (
                  <div key={i} className="p-3 bg-white rounded-xl border border-amber-200 text-xs">
                    <span className="font-bold text-amber-950 block mb-0.5">{r.reglaNombre}</span>
                    <span className="text-slate-700 leading-relaxed block">{r.margen}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-800 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <p className="font-semibold">
                ¡Destino plenamente compatible! Cumple el 100% de tus restricciones y requisitos de viaje.
              </p>
            </div>
          )}

          {/* Section 1: Aportación por criterios de preferencia */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-600" />
                <span>Puntuación y justificación por criterios</span>
              </h4>
              <span className="text-xs text-slate-500 font-normal">
                Fórmula: suma(peso × afinidad) / suma(5 × peso)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {criterios.map((c) => {
                return (
                  <div
                    key={c.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-indigo-200 transition-all shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="text-sm font-bold text-slate-900">
                          {c.nombreCriterio}
                        </span>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>
                            Tu peso: <strong>{c.peso}/5</strong>
                          </span>
                          <span>•</span>
                          <span>
                            Afinidad destino: <strong>{c.afinidad}/5</strong>
                            {c.esSinDato && ' (defecto por falta de dato)'}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-black text-indigo-600">
                          {c.puntosAportados} / {c.maximoPosible} pts
                        </span>
                      </div>
                    </div>

                    {/* Barra visual de logro */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-3">
                      <div
                        className="bg-indigo-600 h-full rounded-full"
                        style={{ width: `${c.porcentaje}%` }}
                      />
                    </div>

                    {/* Dato real justificativo con unidad y calidad */}
                    <div className="pt-2 border-t border-slate-100 flex flex-col gap-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 font-medium">Dato real medido:</span>
                        <strong className="text-slate-900 font-semibold">
                          {c.datoRealFormateado}
                        </strong>
                      </div>

                      <div className="mt-1">
                        <QualityBadge
                          calidad={c.calidad}
                          fuente={c.fuente}
                          fecha={c.fecha}
                          obs={c.observaciones}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Atributos clave de restricción */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-violet-600" />
              <span>Condiciones de viaje y entrada</span>
            </h4>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {atributosPrincipales.map((attr) => (
                <div key={attr.clave} className="space-y-1">
                  <span className="text-xs text-slate-500 font-medium block">
                    {attr.etiqueta}
                  </span>
                  <div className="text-sm font-bold text-slate-900">
                    {attr.valorFormateado}
                  </div>
                  <QualityBadge
                    calidad={attr.calidad}
                    fuente={attr.fuente}
                    fecha={attr.fecha}
                    showDetails={false}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section 2.5: Clima Anual Detallado */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 mb-3">
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Condiciones Climáticas Mensuales</span>
            </h4>
            <ClimateChart
              clima={pais.clima}
              mesSeleccionado={mesSeleccionado}
              paisNombre={pais.nombre}
            />
          </div>

          {/* Section 3: Reglas evaluadas sin descartar */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Reglas de filtro superadas ({reglasSuperadas.length})</span>
            </h4>
            <p className="text-xs text-slate-500 mb-3">
              Este país cumplió todas las condiciones de restricción y no fue descartado por ninguna regla eliminatoria.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {reglasSuperadas.map((rId) => (
                <span
                  key={rId}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold"
                >
                  Regla {rId}: Superada ✓
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            Cerrar explicación
          </button>
        </div>
      </div>
    </div>
  );
};
