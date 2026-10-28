import React, { useState } from 'react';
import {
  Compass,
  CheckSquare,
  ListFilter,
  RotateCcw,
  Plus,
  HelpCircle,
  Menu,
  X,
  Sparkles,
  Trophy,
  XCircle,
  Home,
} from 'lucide-react';

interface NavbarProps {
  currentView: 'home' | 'wizard' | 'results' | 'discarded' | 'rules' | 'tests';
  onNavigate: (view: 'home' | 'wizard' | 'results' | 'discarded' | 'rules' | 'tests') => void;
  kbVersion: number;
  totalPaises: number;
  quedanPaises?: number;
  onReset: () => void;
  hasStarted: boolean;
  onOpenAddQuestion?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  kbVersion,
  totalPaises,
  quedanPaises,
  onReset,
  hasStarted,
  onOpenAddQuestion,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const handleMobileNav = (view: 'home' | 'wizard' | 'results' | 'discarded' | 'rules' | 'tests') => {
    setIsMobileMenuOpen(false);
    onNavigate(view);
  };

  const handleMobileAddQuestion = () => {
    setIsMobileMenuOpen(false);
    if (onOpenAddQuestion) {
      onOpenAddQuestion();
    }
  };

  const handleMobileReset = () => {
    setIsMobileMenuOpen(false);
    onReset();
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo y título */}
          <div
            onClick={() => handleMobileNav('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-100 group-hover:scale-105 transition-transform">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                Akinator de Viajes
                <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-200">
                  v{kbVersion}
                </span>
              </span>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Sistema experto de recomendación determinista
              </p>
            </div>
          </div>

          {/* Dynamic counter if in wizard (Desktop) */}
          {hasStarted && quedanPaises !== undefined && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-100/90 rounded-full border border-slate-200 text-xs font-medium text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>
                Quedan <strong>{quedanPaises}</strong> de {totalPaises} países posibles
              </span>
            </div>
          )}

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-1.5">
            {hasStarted && (
              <>
                <button
                  onClick={() => onNavigate('wizard')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    currentView === 'wizard'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Cuestionario
                </button>
                <button
                  onClick={() => onNavigate('results')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    currentView === 'results'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Resultados
                </button>
                <button
                  onClick={() => onNavigate('discarded')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    currentView === 'discarded'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Descartes
                </button>
              </>
            )}

            {/* Reglas button visible always */}
            <button
              onClick={() => onNavigate('rules')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                currentView === 'rules'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Ver el gestor de reglas y trazabilidad del motor"
            >
              Reglas
            </button>

            {/* Botón "+ Añadir Pregunta" directo en Navbar Desktop */}
            {onOpenAddQuestion && (
              <button
                onClick={onOpenAddQuestion}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors cursor-pointer"
                title="Añadir una nueva pregunta al cuestionario del sistema experto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Añadir Pregunta</span>
              </button>
            )}

            <button
              onClick={() => onNavigate('tests')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border cursor-pointer ${
                currentView === 'tests'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
              }`}
              title="Ejecutar banco de 16 pruebas automatizadas"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Pruebas (16)</span>
            </button>

            {hasStarted && (
              <button
                onClick={onReset}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1 cursor-pointer"
                title="Reiniciar cuestionario"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reiniciar</span>
              </button>
            )}
          </nav>

          {/* Botón Menú Hamburguesa para Móvil */}
          <div className="flex md:hidden items-center gap-2">
            {onOpenAddQuestion && (
              <button
                onClick={onOpenAddQuestion}
                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer"
                title="Añadir Pregunta"
              >
                <Plus className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label="Abrir menú de navegación"
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-slate-900" />
              ) : (
                <Menu className="w-6 h-6 text-slate-900" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* MENÚ DESPLEGABLE MÓVIL */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/98 backdrop-blur-lg px-4 pt-3 pb-6 space-y-2 shadow-xl animate-in slide-in-from-top-2 duration-200">
          {hasStarted && quedanPaises !== undefined && (
            <div className="px-3 py-2 mb-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 flex items-center justify-between font-medium">
              <span>Destinos viables restantes:</span>
              <span className="font-extrabold text-emerald-600">{quedanPaises} / {totalPaises}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-1">
            <button
              onClick={() => handleMobileNav('home')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-left transition-colors cursor-pointer ${
                currentView === 'home'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Inicio</span>
            </button>

            {hasStarted && (
              <>
                <button
                  onClick={() => handleMobileNav('wizard')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-left transition-colors cursor-pointer ${
                    currentView === 'wizard'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Compass className="w-4 h-4" />
                  <span>Cuestionario interactivo</span>
                </button>

                <button
                  onClick={() => handleMobileNav('results')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-left transition-colors cursor-pointer ${
                    currentView === 'results'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Trophy className="w-4 h-4" />
                  <span>Resultados y Recomendaciones</span>
                </button>

                <button
                  onClick={() => handleMobileNav('discarded')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-left transition-colors cursor-pointer ${
                    currentView === 'discarded'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <XCircle className="w-4 h-4" />
                  <span>Destinos descartados</span>
                </button>
              </>
            )}

            <button
              onClick={() => handleMobileNav('rules')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-left transition-colors cursor-pointer ${
                currentView === 'rules'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <ListFilter className="w-4 h-4" />
              <span>Reglas y trazabilidad del motor</span>
            </button>

            <button
              onClick={() => handleMobileNav('tests')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-left transition-colors cursor-pointer ${
                currentView === 'tests'
                  ? 'bg-emerald-600 text-white'
                  : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Banco de pruebas (16)</span>
            </button>
          </div>

          {/* Acciones móviles destacadas */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            {onOpenAddQuestion && (
              <button
                onClick={handleMobileAddQuestion}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Añadir Nueva Pregunta</span>
              </button>
            )}

            {hasStarted && (
              <button
                onClick={handleMobileReset}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reiniciar cuestionario</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
