import React from 'react';
import { HechosUsuario } from '../data/types';
import { Compass, Sparkles, Shield, Sliders, ArrowRight, CheckCircle2, MapPin, Palmtree, Landmark, Users, Mountain } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: () => void;
  onSelectPreset: (preset: HechosUsuario) => void;
  totalPaises: number;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onStart,
  onSelectPreset,
  totalPaises,
}) => {
  const perfilesEjemplo: {
    nombre: string;
    descripcion: string;
    icon: React.ReactNode;
    color: string;
    hechos: HechosUsuario;
  }[] = [
    {
      nombre: 'Escapada playera europea',
      descripcion: 'Sol, mar y relax cercano con buen presupuesto.',
      icon: <Palmtree className="w-5 h-5 text-amber-500" />,
      color: 'hover:border-amber-300 hover:bg-amber-50/30',
      hechos: {
        presupuesto_diario: 160,
        dias: 7,
        mes: 7,
        horas_max: 4,
        companeros: 'pareja',
        max_tramite: 0,
        acepta_vacunas: 'No',
        acepta_riesgo: 'No',
        clima: 'calido',
        tolera_lluvia: 'No',
        peso_playa: 5,
        peso_gastronomia: 4,
        peso_precio: 3,
      },
    },
    {
      nombre: 'Gran viaje cultural y gastronómico',
      descripcion: 'Monumentos UNESCO, gastronomía de autor y patrimonio.',
      icon: <Landmark className="w-5 h-5 text-indigo-500" />,
      color: 'hover:border-indigo-300 hover:bg-indigo-50/30',
      hechos: {
        presupuesto_diario: 200,
        dias: 12,
        mes: 5,
        horas_max: 14,
        companeros: 'pareja',
        max_tramite: 2,
        acepta_vacunas: 'Sí',
        acepta_riesgo: 'No',
        clima: 'templado',
        tolera_lluvia: 'Sí',
        peso_cultura: 5,
        peso_gastronomia: 5,
        peso_seguridad: 4,
      },
    },
    {
      nombre: 'Vacaciones familiares seguras',
      descripcion: 'Con niños, bajo riesgo, trámites fáciles y comodidad.',
      icon: <Users className="w-5 h-5 text-emerald-500" />,
      color: 'hover:border-emerald-300 hover:bg-emerald-50/30',
      hechos: {
        presupuesto_diario: 180,
        dias: 10,
        mes: 6,
        horas_max: 6,
        companeros: 'ninos',
        max_tramite: 0,
        acepta_vacunas: 'No',
        acepta_riesgo: 'No',
        clima: 'templado',
        tolera_lluvia: 'No',
        peso_seguridad: 5,
        peso_playa: 4,
      },
    },
    {
      nombre: 'Mochilero y naturaleza salvaje',
      descripcion: 'Paisajes épicos, aventura y máxima optimización de costes.',
      icon: <Mountain className="w-5 h-5 text-teal-500" />,
      color: 'hover:border-teal-300 hover:bg-teal-50/30',
      hechos: {
        presupuesto_diario: 65,
        dias: 18,
        mes: 9,
        horas_max: 16,
        companeros: 'solo',
        max_tramite: 2,
        acepta_vacunas: 'Sí',
        acepta_riesgo: 'Sí',
        clima: 'indiferente',
        tolera_lluvia: 'Sí',
        peso_naturaleza: 5,
        peso_precio: 5,
        peso_cultura: 3,
      },
    },
  ];

  return (
    <div className="flex-1 flex flex-col justify-center items-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full text-center space-y-8">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-700 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Sistema Experto Determinista de Viajes</span>
        </div>

        {/* Hero Title */}
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Descubre tu destino ideal con el{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
              Akinator de viajes
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Nuestro motor de inferencia evalúa en tiempo real restricciones de vuelo, presupuesto, clima mensual y afinidades entre {totalPaises} países del mundo.
          </p>
        </div>

        {/* Call to Action principal */}
        <div className="pt-2">
          <button
            onClick={onStart}
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-base shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-indigo-300 cursor-pointer"
          >
            <span>Iniciar cuestionario personalizado</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-xs text-slate-500 mt-2">
            Flujo guiado paso a paso con preguntas de restricción y afinidad
          </p>
        </div>

        {/* Perfiles de Viajero Rápidos */}
        <div className="pt-4 border-t border-slate-200">
          <div className="text-left mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              O empieza al instante con un perfil de viajero predefinido:
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-left">
            {perfilesEjemplo.map((p, idx) => (
              <div
                key={idx}
                onClick={() => onSelectPreset(p.hechos)}
                className={`p-4 rounded-2xl bg-white border border-slate-200 shadow-xs cursor-pointer transition-all hover:scale-[1.02] ${p.color}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                    {p.icon}
                  </div>
                  <span className="text-[11px] font-bold text-indigo-600 hover:underline">
                    Cargar →
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 leading-snug mb-1">
                  {p.nombre}
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {p.descripcion}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left pt-2">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2.5">
              <Shield className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 mb-0.5">Filtros y Restricciones</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Presupuesto, horas de vuelo, visados y vacunas analizados rigurosamente.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-2.5">
              <Sliders className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 mb-0.5">Afinidad Ponderada</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Puntúa playa, cultura, gastronomía y cercanía con pesos personalizados.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 mb-0.5">Trazabilidad Total</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Explicaciones transparentes con datos oficiales y registro de reglas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
