import React from 'react';
import { ClimaInfo } from '../data/types';
import { Sun, CloudRain, Calendar } from 'lucide-react';

interface ClimateChartProps {
  clima: ClimaInfo | null;
  mesSeleccionado?: number; // 1-12
  paisNombre: string;
}

const NOMBRES_MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export const ClimateChart: React.FC<ClimateChartProps> = ({
  clima,
  mesSeleccionado,
  paisNombre,
}) => {
  if (!clima || !clima.temperatura || clima.temperatura.length !== 12) {
    return (
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 italic text-center">
        Datos climáticos mensuales no disponibles para {paisNombre}.
      </div>
    );
  }

  const { temperatura, precipitacion } = clima;
  const maxTemp = Math.max(...temperatura, 30);
  const minTemp = Math.min(...temperatura, 0);
  const tempRange = maxTemp - minTemp || 30;
  const maxPrec = Math.max(...precipitacion, 100);

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-600" />
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Comportamiento Climático Anual (12 Meses)
          </h5>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            Temperatura (°C)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-sky-400 inline-block" />
            Lluvia (mm)
          </span>
        </div>
      </div>

      {/* Grid de 12 meses */}
      <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 pt-2">
        {NOMBRES_MESES.map((mes, idx) => {
          const numMes = idx + 1;
          const temp = temperatura[idx];
          const prec = precipitacion[idx];
          const isSelected = mesSeleccionado === numMes;

          // Porcentaje de altura para gráfico visual
          const tempHeightPercent = Math.max(
            15,
            Math.min(100, Math.round(((temp - minTemp) / tempRange) * 100))
          );
          const precHeightPercent = Math.max(
            10,
            Math.min(100, Math.round((prec / maxPrec) * 100))
          );

          return (
            <div
              key={mes}
              className={`flex flex-col items-center p-2 rounded-xl border transition-all ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/80 shadow-xs ring-1 ring-indigo-200 scale-105'
                  : 'border-slate-100 bg-slate-50/50 hover:bg-slate-100/60'
              }`}
            >
              <span
                className={`text-[11px] font-bold mb-1 ${
                  isSelected ? 'text-indigo-900 font-extrabold' : 'text-slate-600'
                }`}
              >
                {mes}
              </span>

              {/* Barrita de precipitación y temperatura */}
              <div className="h-16 w-full flex items-end justify-center gap-1 my-1">
                {/* Barra lluvia */}
                <div
                  className="w-1.5 bg-sky-300 rounded-t-sm transition-all"
                  style={{ height: `${precHeightPercent}%` }}
                  title={`Lluvia en ${mes}: ${prec} mm`}
                />
                {/* Barra temp */}
                <div
                  className={`w-1.5 rounded-t-sm transition-all ${
                    temp >= 22
                      ? 'bg-amber-500'
                      : temp >= 12
                      ? 'bg-emerald-500'
                      : 'bg-sky-600'
                  }`}
                  style={{ height: `${tempHeightPercent}%` }}
                  title={`Temp media en ${mes}: ${temp} °C`}
                />
              </div>

              {/* Valores numéricos */}
              <span className="text-[10px] font-bold text-slate-800">{temp}°</span>
              <span className="text-[9px] text-slate-600">{prec}mm</span>

              {isSelected && (
                <span className="mt-1 text-[8px] uppercase tracking-wider font-extrabold px-1 rounded-sm bg-indigo-600 text-white">
                  Viaje
                </span>
              )}
            </div>
          );
        })}
      </div>

      {mesSeleccionado && (
        <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 flex items-center justify-between">
          <span>
            Mes previsto: <strong>{NOMBRES_MESES[mesSeleccionado - 1]}</strong>
          </span>
          <span>
            Temperatura media: <strong>{temperatura[mesSeleccionado - 1]} °C</strong> ({temperatura[mesSeleccionado - 1] >= 22 ? 'Cálido' : temperatura[mesSeleccionado - 1] >= 12 ? 'Templado' : 'Fresco'})
          </span>
          <span>
            Precipitación acumulada: <strong>{precipitacion[mesSeleccionado - 1]} mm</strong>
          </span>
        </div>
      )}
    </div>
  );
};
