import React from 'react';
import { HechosUsuario } from '../data/types';
import { Sliders, RotateCcw, Calendar, Euro, Plane, Sparkles } from 'lucide-react';

interface SensitivitySimulatorProps {
  hechos: HechosUsuario;
  onUpdateHecho: (clave: string, valor: any) => void;
  onReset: () => void;
}

const NOMBRES_MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const SensitivitySimulator: React.FC<SensitivitySimulatorProps> = ({
  hechos,
  onUpdateHecho,
  onReset,
}) => {
  const criterios = [
    { id: 'playa', label: 'Playa y costa', icon: '🏖️' },
    { id: 'cultura', label: 'Patrimonio y museos', icon: '🏛️' },
    { id: 'naturaleza', label: 'Naturaleza y paisajes', icon: '🌲' },
    { id: 'gastronomia', label: 'Gastronomía local', icon: '🍷' },
    { id: 'precio', label: 'Destino económico', icon: '💰' },
    { id: 'seguridad', label: 'Seguridad alta', icon: '🛡️' },
    { id: 'ingles', label: 'Nivel de inglés', icon: '🗣️' },
    { id: 'clima', label: 'Clima ideal', icon: '☀️' },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-xs">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900">
              Simulador "¿Qué pasaría si...?" (Análisis de Sensibilidad)
            </h4>
            <p className="text-xs text-slate-500">
              Mueve los controles para recalcular las recomendaciones y porcentajes en tiempo real.
            </p>
          </div>
        </div>

        <button
          onClick={onReset}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restablecer hechos originales</span>
        </button>
      </div>

      {/* 1. Ajustes Rápidos de Restricciones Clave */}
      <div>
        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
          Restricciones Logísticas Clave
        </h5>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Presupuesto diario */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1">
                <Euro className="w-3.5 h-3.5 text-slate-500" />
                <span>Presupuesto diario</span>
              </span>
              <strong className="text-slate-900 font-bold">
                {hechos.presupuesto_diario || 150} € / día
              </strong>
            </div>
            <input
              type="range"
              min={30}
              max={500}
              step={10}
              value={hechos.presupuesto_diario || 150}
              onChange={(e) => onUpdateHecho('presupuesto_diario', Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          {/* Horas de vuelo */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1">
                <Plane className="w-3.5 h-3.5 text-slate-500" />
                <span>Límite de vuelo</span>
              </span>
              <strong className="text-slate-900 font-bold">
                {hechos.horas_max || 8} horas
              </strong>
            </div>
            <input
              type="range"
              min={1}
              max={24}
              step={1}
              value={hechos.horas_max || 8}
              onChange={(e) => onUpdateHecho('horas_max', Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          {/* Mes de viaje */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Mes de viaje</span>
              </span>
              <strong className="text-slate-900 font-bold">
                {NOMBRES_MESES[(Number(hechos.mes) || 5) - 1]}
              </strong>
            </div>
            <select
              value={hechos.mes || 5}
              onChange={(e) => onUpdateHecho('mes', Number(e.target.value))}
              className="w-full px-2.5 py-1 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-800 outline-none cursor-pointer"
            >
              {NOMBRES_MESES.map((m, idx) => (
                <option key={m} value={idx + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. Sliders de Ponderación de Preferencias */}
      <div>
        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
          Afinidades y Pesos (1 a 5, o 0 para no ponderar)
        </h5>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {criterios.map((c) => {
            const pesoActual = Number(hechos[`peso_${c.id}`] ?? 0);

            return (
              <div
                key={c.id}
                className="p-3 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 truncate flex items-center gap-1">
                    <span>{c.icon}</span>
                    <span>{c.label}</span>
                  </span>
                  <span className="font-black text-indigo-700">
                    {pesoActual === 0 ? 'Ignorado (0)' : `${pesoActual} / 5`}
                  </span>
                </div>

                <input
                  type="range"
                  min={0}
                  max={5}
                  step={1}
                  value={pesoActual}
                  onChange={(e) => onUpdateHecho(`peso_${c.id}`, Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
