import React, { useState } from 'react';
import { ResultadoInferencia, PaisEvaluado } from '../engine/types';
import { HechosUsuario } from '../data/types';
import { ExplainModal } from './ExplainModal';
import { ClimateChart } from './ClimateChart';
import { DestinationComparator } from './DestinationComparator';
import { SensitivitySimulator } from './SensitivitySimulator';
import { explicarPais, ExplicacionCompletaPais } from '../explain/explainer';
import {
  Trophy,
  AlertTriangle,
  RotateCcw,
  TrendingUp,
  MapPin,
  Plane,
  Euro,
  Shield,
  Sparkles,
  ChevronRight,
  Info,
  CheckCircle2,
  Sliders,
  Scale,
  Copy,
  Check,
  Calendar,
  Wallet,
  Clock,
} from 'lucide-react';

interface ResultsViewProps {
  resultado: ResultadoInferencia;
  hechos: HechosUsuario;
  onRestart: () => void;
  onApplyRelaxation?: (criterioId?: string, reglaId?: string) => void;
  onUpdateHecho: (clave: string, valor: any) => void;
}

const NOMBRES_MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const ResultsView: React.FC<ResultsViewProps> = ({
  resultado,
  hechos,
  onRestart,
  onApplyRelaxation,
  onUpdateHecho,
}) => {
  const [modalExplicacion, setModalExplicacion] = useState<ExplicacionCompletaPais | null>(null);
  const [showSimulator, setShowSimulator] = useState<boolean>(false);
  const [selectedForCompare, setSelectedForCompare] = useState<number[]>([]);
  const [showComparator, setShowComparator] = useState<boolean>(false);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);

  const top3 = resultado.paisesValidos.slice(0, 3);
  const restoPaises = resultado.paisesValidos.slice(3);

  const handleOpenExplain = (p: PaisEvaluado, index: number) => {
    setModalExplicacion(explicarPais(p, index + 1));
  };

  const toggleCompare = (paisId: number) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(paisId)) {
        return prev.filter((id) => id !== paisId);
      }
      if (prev.length >= 3) {
        return [prev[1], prev[2], paisId];
      }
      return [...prev, paisId];
    });
  };

  const handleCopyReport = () => {
    const lines: string[] = [];
    lines.push('=== INFORME DE RECOMENDACIÓN — AKINATOR DE VIAJES ===');
    lines.push(`Fecha de consulta: ${new Date().toLocaleDateString('es-ES')}`);
    if (hechos.dias) lines.push(`Duración: ${hechos.dias} días`);
    if (hechos.mes) lines.push(`Mes previsto: ${NOMBRES_MESES[Number(hechos.mes) - 1]}`);
    if (hechos.presupuesto_diario) lines.push(`Presupuesto diario: ${hechos.presupuesto_diario} €/día`);
    lines.push('');
    lines.push('--- DESTINOS TOP RECOMENDADOS ---');

    top3.forEach((p, idx) => {
      const coste = p.pais.atributos.coste_diario?.valor;
      const vuelo = p.pais.atributos.horas_vuelo?.valor;
      const totalEstimado = typeof coste === 'number' && hechos.dias ? coste * Number(hechos.dias) : null;

      lines.push(`${idx + 1}. ${p.pais.nombre} (${p.pais.zona}) — Compatibilidad: ${p.compatibilidad}%`);
      lines.push(`   - Coste diario: ${coste} €/día ${totalEstimado ? `(Total ~${totalEstimado} € para ${hechos.dias} días)` : ''}`);
      lines.push(`   - Vuelo directo estimado: ${vuelo} horas`);
      lines.push(`   - Seguridad: ${p.pais.atributos.seguridad?.valor}`);
      lines.push(`   - Entrada: ${p.pais.atributos.entrada_espanoles?.valor}`);

      if (p.reglasIncumplidas && p.reglasIncumplidas.length > 0) {
        lines.push(`   - Salvedades / Márgenes a considerar:`);
        p.reglasIncumplidas.forEach((r) => lines.push(`     * ${r.reglaNombre}: ${r.margen}`));
      } else {
        lines.push(`   - Cumple al 100% todas tus condiciones.`);
      }
      lines.push('');
    });

    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 3000);
  };

  const destinosParaComparar = resultado.paisesValidos.filter((p) =>
    selectedForCompare.includes(p.pais.id)
  );

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Header con Resumen y Herramientas */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
              Evaluación Completada
            </span>
            <span className="text-xs text-slate-500">
              {resultado.paisesValidos.length} destinos recomendados
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Recomendaciones para tu viaje
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Modo flexible por defecto (umbral M1 fijo en 70%): garantiza un Top 3 destacando los destinos recomendados y alternativas que más se ajustan.
          </p>
        </div>

        {/* Acciones principales */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
          {/* Botón Simulador "¿Qué pasaría si...?" */}
          <button
            onClick={() => setShowSimulator((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              showSimulator
                ? 'bg-violet-600 text-white border-violet-600 shadow-xs'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{showSimulator ? 'Ocultar simulador' : 'Simulador "¿Y si...?"'}</span>
          </button>

          {/* Botón Comparador Cara a Cara */}
          <button
            onClick={() => setShowComparator(true)}
            disabled={selectedForCompare.length < 2}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              selectedForCompare.length >= 2
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs hover:bg-indigo-700'
                : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
            }`}
            title="Selecciona 2 o 3 países para comparar sus datos frente a frente"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Comparar ({selectedForCompare.length}/3)</span>
          </button>

          {/* Botón Copiar Informe */}
          <button
            onClick={handleCopyReport}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer"
            title="Copiar resumen del viaje con recomendaciones y requisitos"
          >
            {copiedReport ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar informe</span>
              </>
            )}
          </button>

          <button
            onClick={onRestart}
            className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-500 hover:text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer"
            title="Reiniciar cuestionario"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Simulador de Sensibilidad "¿Qué pasaría si...?" (Desplegable) */}
      {showSimulator && (
        <SensitivitySimulator
          hechos={hechos}
          onUpdateHecho={onUpdateHecho}
          onReset={onRestart}
        />
      )}

      {/* 2. Alertas de Conflictos (C1, C2, C3) */}
      {resultado.conflictos.length > 0 && (
        <div className="space-y-3">
          {resultado.conflictos.map((c) => (
            <div
              key={c.reglaId}
              className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 shadow-xs"
            >
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-xs font-bold uppercase tracking-wider text-amber-900 block mb-0.5">
                  Aviso de Conflicto en Preferencias ({c.nombre}):
                </strong>
                <p className="text-sm text-amber-800">{c.mensaje}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. Alertas de Sistema (D2 u otras, excluyendo M1 si se muestra abajo) */}
      {resultado.avisosSistema.filter((a) => !a.includes('70 %')).length > 0 && (
        <div className="space-y-2">
          {resultado.avisosSistema
            .filter((a) => !a.includes('70 %'))
            .map((aviso, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 flex items-start gap-2.5 text-xs text-indigo-900"
              >
                <Info className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">{aviso}</p>
              </div>
            ))}
        </div>
      )}

      {/* 4. Caso M1: Aviso cuando el mejor país tiene compatibilidad < 70 % y propuesta de relajación */}
      {resultado.avisoM1Activo && (
        <div className="p-5 rounded-3xl bg-amber-50/90 border-2 border-amber-300 text-slate-800 space-y-3 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-amber-900">
                {resultado.mensajeM1 || 'Ningún país supera el 70 % de compatibilidad; estos son los que más se ajustan.'}
              </h3>
              {resultado.sugerenciaRelajacion && (
                <p className="text-xs text-amber-800 leading-relaxed">
                  💡 <strong>Propuesta de relajación:</strong> {resultado.sugerenciaRelajacion.sugerenciaTexto}
                </p>
              )}
            </div>
          </div>

          {onApplyRelaxation && resultado.sugerenciaRelajacion && (
            <div className="pl-8 pt-1">
              <button
                onClick={() =>
                  onApplyRelaxation(
                    resultado.sugerenciaRelajacion?.criterioId,
                    resultado.sugerenciaRelajacion?.reglaId
                  )
                }
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <span>Relajar restricción sugerida ({resultado.sugerenciaRelajacion.reglaId === 'F10' ? 'Bajar peso de 5 a 4' : 'Ajustar filtro'})</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* 5. TOP 3 DESTINOS RECOMENDADOS */}
      {top3.length > 0 && (() => {
        const paisesCumplenCount = resultado.paisesCumplenTodos.length;
        const maxCompMostrados = Math.max(0, ...top3.map((p) => p.compatibilidad ?? 0));

        return (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-bold text-slate-900">
                  {paisesCumplenCount === 0
                    ? 'Los que más se ajustan'
                    : paisesCumplenCount < 3
                    ? 'Destinos recomendados y alternativas que más se ajustan (Top 3)'
                    : 'Destinos más recomendados (Top 3)'}
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                Marca la casilla de 2 o 3 países para ver la comparativa cara a cara
              </span>
            </div>

            {/* Banner explicativo de jerarquía: filtros obligatorios vs afinidad */}
            {paisesCumplenCount > 0 && paisesCumplenCount < 3 && (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-50/90 via-sky-50/80 to-amber-50/90 border border-indigo-200/90 shadow-xs mb-5 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-indigo-600 text-white flex-shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {top3[0]?.pais.nombre} es tu destino #1 porque cumple el 100% de tus filtros obligatorios
                  </h4>
                </div>
                <div className="text-xs text-slate-700 space-y-1.5 pl-7 leading-relaxed">
                  <p>
                    • <strong>Filtros estrictos prioritarios:</strong> <strong>{top3[0]?.pais.nombre}</strong> es el único destino que respeta estrictamente todos tus límites no negociables (presupuesto diario, horas de vuelo, visado o seguridad). Por eso encabeza la recomendación.
                  </p>
                  <p>
                    • <strong>Por qué {top3.slice(1).map((p) => p.pais.nombre).join(' y ')} muestran mayor porcentaje:</strong> Tienen mayor afinidad teórica en tus preferencias ({top3.slice(1).map((p) => `${p.pais.nombre}: ${p.compatibilidad}%`).join(', ')}), pero <strong>incumplen algún límite obligatorio</strong>. Por regla M2, se muestran como <em>&ldquo;Los que más se ajustan&rdquo;</em> para darte opciones si decides flexibilizar esas condiciones.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {top3.map((p, index) => {
                const coste = p.pais.atributos.coste_diario?.valor;
                const vuelo = p.pais.atributos.horas_vuelo?.valor;
                const seguridad = p.pais.atributos.seguridad?.valor;
                const isCheckedForCompare = selectedForCompare.includes(p.pais.id);
                const diasNum = Number(hechos.dias);
                const costeTotalViaje = typeof coste === 'number' && diasNum > 0 ? coste * diasNum : null;

                const topBadgeTexto = p.esAjusteAproximado
                  ? 'Los que más se ajustan'
                  : paisesCumplenCount === 1
                  ? '★ Cumple el 100% de tus filtros'
                  : (p.compatibilidad ?? 0) >= maxCompMostrados
                  ? '★ Máxima compatibilidad'
                  : index === 0
                  ? '★ Recomendación principal'
                  : '★ Cumple todos tus filtros';

                return (
                  <div
                    key={p.pais.id}
                    className={`rounded-3xl border-2 transition-all p-6 flex flex-col justify-between bg-white shadow-sm hover:shadow-md relative ${
                      index === 0 && !p.esAjusteAproximado
                        ? 'border-indigo-600 ring-2 ring-indigo-100'
                        : p.esAjusteAproximado
                        ? 'border-amber-300'
                        : 'border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    {/* Top Badge */}
                    <div
                      className={`absolute -top-3.5 left-6 text-white px-3 py-0.5 rounded-full text-xs font-bold tracking-wide shadow-xs ${
                        p.esAjusteAproximado
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                          : 'bg-gradient-to-r from-indigo-600 to-violet-600'
                      }`}
                    >
                      {topBadgeTexto}
                    </div>

                    <div>
                      {/* Country header & Compare Checkbox */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`text-xs font-black px-1.5 py-0.5 rounded-md ${
                                p.esAjusteAproximado
                                  ? 'text-amber-800 bg-amber-100'
                                  : 'text-indigo-800 bg-indigo-100'
                              }`}
                            >
                              #{index + 1}
                            </span>
                            <h4 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                              {p.pais.nombre}
                            </h4>
                            {p.esAjusteAproximado ? (
                              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                Ajuste aproximado
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                100% Filtros
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-500 font-medium block mt-0.5">
                            {p.pais.zona} • {p.pais.subzona}
                          </span>
                        </div>

                        <div className="flex flex-col items-end gap-1.5">
                          {p.compatibilidad !== null ? (
                            <div
                              className={`px-3 py-1 rounded-2xl text-right border ${
                                p.esAjusteAproximado
                                  ? 'bg-amber-50/90 border-amber-300'
                                  : 'bg-indigo-50 border-indigo-200'
                              }`}
                            >
                              <span
                                className={`text-xl font-black block leading-tight ${
                                  p.esAjusteAproximado ? 'text-amber-800' : 'text-indigo-700'
                                }`}
                              >
                                {p.compatibilidad}%
                              </span>
                              <span
                                className={`text-[9px] uppercase font-bold tracking-wider ${
                                  p.esAjusteAproximado ? 'text-amber-700' : 'text-indigo-500'
                                }`}
                              >
                                {p.esAjusteAproximado ? 'Afinidad teórica' : 'Afinidad'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Sin ponderar</span>
                          )}

                          <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={isCheckedForCompare}
                              onChange={() => toggleCompare(p.pais.id)}
                              className="rounded text-indigo-600 accent-indigo-600 cursor-pointer"
                            />
                            <span>Comparar</span>
                          </label>
                        </div>
                      </div>

                    {/* AVISO DE REGLAS INCUMPLIDAS CON MARGEN */}
                    {p.reglasIncumplidas && p.reglasIncumplidas.length > 0 ? (
                      <div className="mb-4 p-3 rounded-2xl bg-amber-50/90 border border-amber-200 text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                          <span>
                            {p.esAjusteAproximado ? 'Los que más se ajustan' : 'Salvedades'} ({p.reglasIncumplidas.length} restricción{p.reglasIncumplidas.length > 1 ? 'es no cumplidas' : ' no cumplida'}):
                          </span>
                        </div>
                        <ul className="space-y-1 text-amber-800 text-[11px] leading-tight">
                          {p.reglasIncumplidas.map((r, i) => (
                            <li key={i} className="flex items-start gap-1">
                              <span>•</span>
                              <span><strong>{r.reglaNombre}:</strong> {r.margen}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="mb-4 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          <span>Cumple el 100% de tus filtros obligatorios</span>
                        </div>
                        <span className="text-[10px] text-emerald-700 font-normal">0 restricciones rotas</span>
                      </div>
                    )}

                    {/* Quick Metric Pills */}
                    <div className="grid grid-cols-3 gap-2 py-3 px-3 bg-slate-50 rounded-2xl border border-slate-100 text-center mb-3">
                      <div>
                        <span className="text-[10px] text-slate-400 font-medium block">Coste/día</span>
                        <strong className="text-xs text-slate-800 font-bold">
                          {coste !== 'SIN DATO' ? `${coste} €` : 'N/D'}
                        </strong>
                      </div>
                      <div className="border-x border-slate-200">
                        <span className="text-[10px] text-slate-400 font-medium block">Vuelo</span>
                        <strong className="text-xs text-slate-800 font-bold">{vuelo} h</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-medium block">Seguridad</span>
                        <strong className="text-[10px] text-slate-800 font-bold truncate block">
                          {seguridad}
                        </strong>
                      </div>
                    </div>

                    {/* Estimación de Presupuesto Total para el viaje */}
                    {costeTotalViaje && (
                      <div className="mb-4 px-3 py-2 rounded-xl bg-slate-100/70 border border-slate-200 text-xs flex items-center justify-between text-slate-700">
                        <span className="flex items-center gap-1.5 font-medium text-[11px]">
                          <Wallet className="w-3.5 h-3.5 text-slate-500" />
                          <span>Total viaje ({diasNum} días):</span>
                        </span>
                        <strong className="font-extrabold text-slate-900">
                          ~{costeTotalViaje} €
                        </strong>
                      </div>
                    )}

                    {/* Simple CSS Bar Chart de aportación por criterio */}
                    <div className="space-y-2 mb-5">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1">
                        <span>Aportación por criterio</span>
                        <span>Pts / Max</span>
                      </div>

                      <div className="space-y-1.5">
                        {p.desgloseCriterios
                          .filter((c) => c.peso > 0)
                          .map((c) => (
                            <div key={c.criterioId} className="space-y-0.5">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="capitalize text-slate-700 font-medium">
                                  {c.criterioId} (×{c.peso})
                                </span>
                                <span className="text-slate-500 font-semibold">
                                  {c.puntosAportados}/{c.maximoPosible}
                                </span>
                              </div>
                              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="bg-indigo-500 h-full rounded-full"
                                  style={{ width: `${c.porcentajeAporte}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        {p.desgloseCriterios.filter((c) => c.peso > 0).length === 0 && (
                          <p className="text-xs text-slate-400 italic">
                            No se asignaron pesos de preferencia (&gt; 0).
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Button "Ver por qué" */}
                  <button
                    onClick={() => handleOpenExplain(p, index)}
                    className="w-full py-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 border border-indigo-200 cursor-pointer"
                  >
                    <span>Ver por qué (explicación completa y clima anual)</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      );
    })()}

      {/* 6. TABLA CON EL RESTO DE PAÍSES VÁLIDOS */}
      {restoPaises.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Otros destinos ordenados por compatibilidad ({restoPaises.length})
              </h3>
              <p className="text-xs text-slate-500">
                Destinos ordenados por afinidad de preferencias. Los avisos señalan si alguna opción particular tiene restricciones o márgenes.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-bold text-[10px]">
                <tr>
                  <th className="py-3 px-3 w-10">Comp.</th>
                  <th className="py-3 px-4">Posición</th>
                  <th className="py-3 px-4">País</th>
                  <th className="py-3 px-4">Zona</th>
                  <th className="py-3 px-4">Compatibilidad</th>
                  <th className="py-3 px-4">Estado restricciones</th>
                  <th className="py-3 px-4">Coste / día</th>
                  <th className="py-3 px-4">Vuelo est.</th>
                  <th className="py-3 px-4">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {restoPaises.map((p, idx) => {
                  const rank = idx + 4;
                  const isChecked = selectedForCompare.includes(p.pais.id);

                  return (
                    <tr key={p.pais.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleCompare(p.pais.id)}
                          className="rounded text-indigo-600 accent-indigo-600 cursor-pointer"
                          title="Seleccionar para comparar cara a cara"
                        />
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-400">#{rank}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{p.pais.nombre}</td>
                      <td className="py-3 px-4 text-slate-500">{p.pais.subzona}</td>
                      <td className="py-3 px-4 font-extrabold text-indigo-600">
                        {p.compatibilidad !== null ? `${p.compatibilidad}%` : '—'}
                      </td>
                      <td className="py-3 px-4">
                        {p.esAjusteAproximado || p.reglasIncumplidas.length > 0 ? (
                          <span
                            className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200"
                            title={p.reglasIncumplidas.map((r) => `${r.reglaNombre}: ${r.margen}`).join(' | ')}
                          >
                            <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                            <span>Los que más se ajustan ({p.reglasIncumplidas.length})</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                            <span>Cumple todos</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {p.pais.atributos.coste_diario?.valor !== 'SIN DATO'
                          ? `${p.pais.atributos.coste_diario?.valor} €`
                          : 'SIN DATO'}
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {p.pais.atributos.horas_vuelo?.valor} h
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleOpenExplain(p, rank - 1)}
                          className="text-indigo-600 hover:text-indigo-800 font-semibold text-xs hover:underline cursor-pointer"
                        >
                          Ver detalles
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Explicación Detallada */}
      <ExplainModal
        explicacion={modalExplicacion}
        mesSeleccionado={Number(hechos.mes) || undefined}
        onClose={() => setModalExplicacion(null)}
      />

      {/* Modal de Comparativa Cara a Cara */}
      {showComparator && (
        <DestinationComparator
          destinos={destinosParaComparar}
          mesSeleccionado={Number(hechos.mes) || undefined}
          onRemoveDestino={(id) => toggleCompare(id)}
          onClose={() => setShowComparator(false)}
        />
      )}
    </div>
  );
};
