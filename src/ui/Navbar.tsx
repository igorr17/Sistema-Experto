import React from 'react';
import { Compass, CheckSquare, ListFilter, AlertTriangle, RotateCcw, HelpCircle } from 'lucide-react';

interface NavbarProps {
  currentView: 'home' | 'wizard' | 'results' | 'discarded' | 'rules' | 'tests';
  onNavigate: (view: 'home' | 'wizard' | 'results' | 'discarded' | 'rules' | 'tests') => void;
  kbVersion: number;
  totalPaises: number;
  quedanPaises?: number;
  onReset: () => void;
  hasStarted: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  kbVersion,
  totalPaises,
  quedanPaises,
  onReset,
  hasStarted,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-100 group-hover:scale-105 transition-transform">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                Akinator de Viajes
                <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-200">
                  v{kbVersion}
                </span>
              </span>
              <p className="text-xs text-slate-500 hidden sm:block">
                Sistema experto de recomendación determinista
              </p>
            </div>
          </div>

          {/* Dynamic counter if in wizard */}
          {hasStarted && quedanPaises !== undefined && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100/90 rounded-full border border-slate-200 text-xs font-medium text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>
                Quedan <strong>{quedanPaises}</strong> de {totalPaises} países posibles
              </span>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {hasStarted && (
              <>
                <button
                  onClick={() => onNavigate('wizard')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    currentView === 'wizard'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Cuestionario
                </button>
                <button
                  onClick={() => onNavigate('results')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    currentView === 'results'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Resultados
                </button>
                <button
                  onClick={() => onNavigate('discarded')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    currentView === 'discarded'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Descartes
                </button>
                <button
                  onClick={() => onNavigate('rules')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    currentView === 'rules'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Reglas
                </button>
              </>
            )}

            <button
              onClick={() => onNavigate('tests')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border ${
                currentView === 'tests'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
              }`}
              title="Ejecutar banco de 15 pruebas automatizadas"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Pruebas (15)</span>
            </button>

            {hasStarted && (
              <button
                onClick={onReset}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1"
                title="Reiniciar cuestionario"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reiniciar</span>
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
