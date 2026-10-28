/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { HechosUsuario, KnowledgeBase, Regla, Pregunta } from './data/types';
import { loadKnowledgeBase } from './data/knowledgeLoader';
import {
  obtenerReglasPersonalizadas,
  agregarReglaPersonalizada,
  eliminarReglaPersonalizada,
  alternarReglaPersonalizada,
} from './data/customRules';
import {
  obtenerPreguntasPersonalizadas,
  agregarPreguntaPersonalizada,
  eliminarPreguntaPersonalizada,
} from './data/customQuestions';
import { ejecutarInferencia } from './engine/inference';
import { Navbar } from './ui/Navbar';
import { Footer } from './ui/Footer';
import { WelcomeScreen } from './ui/WelcomeScreen';
import { QuestionWizard } from './ui/QuestionWizard';
import { ResultsView } from './ui/ResultsView';
import { DiscardedCountriesView } from './ui/DiscardedCountriesView';
import { RulesLogView } from './ui/RulesLogView';
import { TestsView } from './ui/TestsView';
import { AddRuleModal } from './ui/AddRuleModal';
import { AddQuestionModal } from './ui/AddQuestionModal';
import { Compass, AlertCircle } from 'lucide-react';

type ViewMode = 'home' | 'wizard' | 'results' | 'discarded' | 'rules' | 'tests';

export default function App() {
  const [kb, setKb] = useState<KnowledgeBase | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const [hechos, setHechos] = useState<HechosUsuario>({});
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [isAddRuleModalOpen, setIsAddRuleModalOpen] = useState<boolean>(false);
  const [isAddQuestionModalOpen, setIsAddQuestionModalOpen] = useState<boolean>(false);

  // Escuchar cambios de hash para navegación por URL (e.g. #/tests)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (hash === 'tests') {
        setCurrentView('tests');
      } else if (hash === 'wizard') {
        setCurrentView('wizard');
      } else if (hash === 'results') {
        setCurrentView('results');
      } else if (hash === 'discarded') {
        setCurrentView('discarded');
      } else if (hash === 'rules') {
        setCurrentView('rules');
      } else if (hash === 'home' || hash === '') {
        // mantener vista o home si no ha empezado
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Chequeo inicial

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Carga inicial de knowledge.json unificado con reglas y preguntas personalizadas
  useEffect(() => {
    loadKnowledgeBase()
      .then((data) => {
        // Unificar reglas personalizadas
        const personalizadasReglas = obtenerReglasPersonalizadas();
        const mapaReglas = new Map(data.reglas.map((r) => [r.id, r]));
        for (const p of personalizadasReglas) {
          mapaReglas.set(p.id, p);
        }

        // Unificar preguntas personalizadas añadidas por el cliente
        const personalizadasPreguntas = obtenerPreguntasPersonalizadas();
        const mapaPreguntas = new Map(data.preguntas.map((q) => [q.id, q]));
        for (const q of personalizadasPreguntas) {
          mapaPreguntas.set(q.id, q);
        }

        setKb({
          ...data,
          reglas: Array.from(mapaReglas.values()),
          preguntas: Array.from(mapaPreguntas.values()),
        });
        setLoading(false);
      })
      .catch((err) => {
        setLoadError(err.message || 'Error cargando knowledge.json');
        setLoading(false);
      });
  }, []);

  const navigateTo = (view: ViewMode) => {
    setCurrentView(view);
    window.location.hash = `#/${view}`;
  };

  const handleStart = () => {
    setHasStarted(true);
    navigateTo('wizard');
  };

  const handleSelectPreset = (preset: HechosUsuario) => {
    setHechos(preset);
    setHasStarted(true);
    navigateTo('results');
  };

  const handleAnswer = (hechoKey: string, valor: any) => {
    setHechos((prev) => ({
      ...prev,
      [hechoKey]: valor,
    }));
  };

  const handleReset = () => {
    setHechos({});
    setHasStarted(false);
    navigateTo('home');
  };

  // Handlers para administración de preguntas por el cliente
  const handleAddQuestion = (nuevaPregunta: Pregunta) => {
    agregarPreguntaPersonalizada(nuevaPregunta);
    setKb((prev) => {
      if (!prev) return prev;
      const filtradas = prev.preguntas.filter((q) => q.id !== nuevaPregunta.id);
      return {
        ...prev,
        preguntas: [...filtradas, nuevaPregunta],
      };
    });
  };

  // Handlers para administración de reglas por el cliente
  const handleAddRule = (nuevaRegla: Regla) => {
    agregarReglaPersonalizada(nuevaRegla);
    setKb((prev) => {
      if (!prev) return prev;
      const filtradas = prev.reglas.filter((r) => r.id !== nuevaRegla.id);
      return {
        ...prev,
        reglas: [...filtradas, nuevaRegla],
      };
    });
  };

  const handleToggleRule = (reglaId: string, activa: boolean) => {
    alternarReglaPersonalizada(reglaId, activa);
    setKb((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        reglas: prev.reglas.map((r) => (r.id === reglaId ? { ...r, activa } : r)),
      };
    });
  };

  const handleDeleteRule = (reglaId: string) => {
    eliminarReglaPersonalizada(reglaId);
    setKb((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        reglas: prev.reglas.filter((r) => r.id !== reglaId),
      };
    });
  };

  // Motor de inferencia en tiempo real (modo flexible con umbral M1 fijo en 70% por defecto)
  const resultadoInferencia = useMemo(() => {
    if (!kb) return null;
    return ejecutarInferencia(kb, hechos);
  }, [kb, hechos]);

  // Manejo de relajación de filtro (regla M1)
  const handleApplyRelaxation = (criterioId?: string, reglaId?: string) => {
    if (criterioId && reglaId === 'F10') {
      // Bajar el 5 a 4 en el criterio correspondiente
      setHechos((prev) => ({
        ...prev,
        [`peso_${criterioId}`]: 4,
      }));
    } else if (reglaId === 'F1') {
      // Ampliar presupuesto diario a 300 €
      setHechos((prev) => ({
        ...prev,
        presupuesto_diario: Math.max(300, (Number(prev.presupuesto_diario) || 100) * 1.5),
      }));
    } else if (reglaId === 'F2') {
      // Ampliar horas de vuelo
      setHechos((prev) => ({
        ...prev,
        horas_max: Math.min(24, (Number(prev.horas_max) || 4) + 4),
      }));
    } else if (reglaId === 'F4') {
      // Aumentar nivel de trámite
      setHechos((prev) => ({
        ...prev,
        max_tramite: Math.min(3, (Number(prev.max_tramite) || 0) + 1),
      }));
    } else if (reglaId === 'F5') {
      // Aceptar riesgo
      setHechos((prev) => ({
        ...prev,
        acepta_riesgo: 'Sí',
      }));
    } else if (reglaId === 'F6') {
      // Aceptar vacunas
      setHechos((prev) => ({
        ...prev,
        acepta_vacunas: 'Sí',
      }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-md animate-bounce">
            <Compass className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Cargando base de conocimiento...</h2>
          <p className="text-xs text-slate-500">Inicializando motor de inferencia determinista</p>
        </div>
      </div>
    );
  }

  if (loadError || !kb) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-rose-200 shadow-md text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
          <h2 className="text-xl font-bold text-rose-900">Error cargando knowledge.json</h2>
          <p className="text-xs text-slate-600">{loadError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar
        currentView={currentView}
        onNavigate={navigateTo}
        kbVersion={kb.version}
        totalPaises={kb.paises.length}
        quedanPaises={resultadoInferencia?.paisesValidos.length}
        onReset={handleReset}
        hasStarted={hasStarted}
        onOpenAddQuestion={() => setIsAddQuestionModalOpen(true)}
      />

      <main className="flex-1 flex flex-col">
        {currentView === 'home' && (
          <WelcomeScreen
            onStart={handleStart}
            onSelectPreset={handleSelectPreset}
            totalPaises={kb.paises.length}
          />
        )}

        {currentView === 'wizard' && (
          <QuestionWizard
            preguntas={kb.preguntas}
            hechos={hechos}
            onAnswer={handleAnswer}
            onFinish={() => navigateTo('results')}
            quedanPaises={resultadoInferencia?.paisesValidos.length ?? kb.paises.length}
            totalPaises={kb.paises.length}
          />
        )}

        {currentView === 'results' && resultadoInferencia && (
          <ResultsView
            resultado={resultadoInferencia}
            hechos={hechos}
            onRestart={handleReset}
            onApplyRelaxation={handleApplyRelaxation}
            onUpdateHecho={handleAnswer}
            onOpenAddRule={() => setIsAddRuleModalOpen(true)}
            onOpenAddQuestion={() => setIsAddQuestionModalOpen(true)}
            onNavigateToRules={() => navigateTo('rules')}
          />
        )}

        {currentView === 'discarded' && resultadoInferencia && (
          <DiscardedCountriesView
            descartados={resultadoInferencia.paisesDescartados}
            onBackToResults={() => navigateTo('results')}
          />
        )}

        {currentView === 'rules' && resultadoInferencia && (
          <RulesLogView
            logs={resultadoInferencia.logReglas}
            reglasSeguidas={resultadoInferencia.reglasSeguidas}
            todasLasReglas={kb.reglas}
            onBackToResults={() => navigateTo(hasStarted ? 'results' : 'home')}
            onOpenAddRule={() => setIsAddRuleModalOpen(true)}
            onToggleRule={handleToggleRule}
            onDeleteRule={handleDeleteRule}
          />
        )}

        {currentView === 'tests' && (
          <TestsView
            kb={kb}
            onBack={() => navigateTo(hasStarted ? 'results' : 'home')}
          />
        )}
      </main>

      <Footer version={kb.version} />

      {/* Modal para añadir nuevas preguntas al cuestionario por el cliente */}
      <AddQuestionModal
        isOpen={isAddQuestionModalOpen}
        onClose={() => setIsAddQuestionModalOpen(false)}
        onAddQuestion={handleAddQuestion}
        totalPreguntasExistentes={kb.preguntas.length}
      />

      {/* Modal para añadir nuevas reglas por el cliente */}
      <AddRuleModal
        isOpen={isAddRuleModalOpen}
        onClose={() => setIsAddRuleModalOpen(false)}
        onAddRule={handleAddRule}
        totalReglasExistentes={kb.reglas.length}
      />
    </div>
  );
}
