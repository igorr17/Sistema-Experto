import React, { useState, useEffect } from 'react';
import { HechosUsuario, Pregunta } from '../data/types';
import { ArrowLeft, ArrowRight, SkipForward, Sparkles, AlertCircle, Clock, Lightbulb, Compass } from 'lucide-react';

interface QuestionWizardProps {
  preguntas: Pregunta[];
  hechos: HechosUsuario;
  onAnswer: (hechoKey: string, valor: any) => void;
  onFinish: () => void;
  quedanPaises: number;
  totalPaises: number;
}

export const QuestionWizard: React.FC<QuestionWizardProps> = ({
  preguntas,
  hechos,
  onAnswer,
  onFinish,
  quedanPaises,
  totalPaises,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const currentQuestion = preguntas[currentIndex];

  // Estado temporal para campos numéricos
  const currentFactValue = currentQuestion ? hechos[currentQuestion.hecho] : undefined;
  const [numericInput, setNumericInput] = useState<string>('');

  useEffect(() => {
    if (currentQuestion && currentQuestion.tipo === 'numero') {
      if (currentFactValue !== undefined && currentFactValue !== null) {
        setNumericInput(String(currentFactValue));
      } else if (currentQuestion.min !== undefined) {
        if (currentQuestion.hecho === 'presupuesto_diario') setNumericInput('150');
        else if (currentQuestion.hecho === 'dias') setNumericInput('10');
        else if (currentQuestion.hecho === 'horas_max') setNumericInput('8');
        else setNumericInput(String(currentQuestion.min));
      } else {
        setNumericInput('');
      }
    }
  }, [currentIndex, currentQuestion]);

  if (!currentQuestion) {
    return null;
  }

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === preguntas.length - 1;
  const progressPercent = Math.round(((currentIndex + 1) / preguntas.length) * 100);

  const handleNext = () => {
    if (isLast) {
      onFinish();
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (!isFirst) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSelectOption = (valor: string | number) => {
    onAnswer(currentQuestion.hecho, valor);
    handleNext();
  };

  const handleNumericSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const val = Number(numericInput);
    if (!isNaN(val)) {
      onAnswer(currentQuestion.hecho, val);
      handleNext();
    }
  };

  const handleSkip = () => {
    if (currentQuestion.tipo === 'escala_1_5') {
      onAnswer(currentQuestion.hecho, 0);
    } else {
      onAnswer(currentQuestion.hecho, undefined);
    }
    handleNext();
  };

  return (
    <div className="flex-1 flex flex-col justify-center max-w-3xl mx-auto w-full px-4 sm:px-6 py-8">
      {/* Top Status Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
              {currentQuestion.bloque === 'restriccion' ? 'Restricción' : 'Preferencia'}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Pregunta {currentIndex + 1} de {preguntas.length}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-200 w-fit">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>
              <strong>{quedanPaises}</strong> destinos con afinidad viable
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 to-violet-600 h-full transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 flex flex-col justify-between min-h-[400px]">
        <div>
          {/* Question Text */}
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-snug tracking-tight mb-3">
            {currentQuestion.texto}
          </h2>

          {currentQuestion.hecho === 'horas_max' && (
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Define tu <strong>límite máximo de vuelo</strong> en horas desde España peninsular (filtro F2).
            </p>
          )}

          {/* Form / Options based on question type */}
          <div className="mt-2">
            {/* 1. TIPO NUMERO */}
            {currentQuestion.tipo === 'numero' && (
              <form onSubmit={handleNumericSubmit} className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative w-full sm:w-64">
                    <input
                      type="number"
                      min={currentQuestion.min}
                      max={currentQuestion.max}
                      value={numericInput}
                      onChange={(e) => setNumericInput(e.target.value)}
                      className="w-full text-2xl font-bold px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 outline-none transition-all text-slate-900 text-center"
                      placeholder="0"
                      autoFocus
                    />
                    {currentQuestion.hecho === 'presupuesto_diario' && (
                      <span className="absolute right-4 top-3.5 text-lg font-medium text-slate-400">
                        €/día
                      </span>
                    )}
                    {currentQuestion.hecho === 'dias' && (
                      <span className="absolute right-4 top-3.5 text-base font-medium text-slate-400">
                        días
                      </span>
                    )}
                    {currentQuestion.hecho === 'horas_max' && (
                      <span className="absolute right-4 top-3.5 text-base font-medium text-slate-400">
                        horas
                      </span>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-medium rounded-xl shadow-md shadow-indigo-100 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Guardar y continuar</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Chips rápidos para horas de vuelo */}
                {currentQuestion.hecho === 'horas_max' && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {[
                      { val: 3, label: '3 h (Europa / Cercano)' },
                      { val: 6, label: '6 h (Medio radio)' },
                      { val: 10, label: '10 h (Costa Este / América)' },
                      { val: 15, label: '15+ h (Larga distancia)' },
                    ].map((preset) => (
                      <button
                        key={preset.val}
                        type="button"
                        onClick={() => setNumericInput(String(preset.val))}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 text-slate-600 hover:text-indigo-700 text-xs font-medium transition-colors cursor-pointer"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Chips rápidos para presupuesto */}
                {currentQuestion.hecho === 'presupuesto_diario' && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {[
                      { val: 60, label: '60 €/día (Económico)' },
                      { val: 120, label: '120 €/día (Medio)' },
                      { val: 200, label: '200 €/día (Confort)' },
                      { val: 300, label: '300+ €/día (Premium)' },
                    ].map((preset) => (
                      <button
                        key={preset.val}
                        type="button"
                        onClick={() => setNumericInput(String(preset.val))}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 text-slate-600 hover:text-indigo-700 text-xs font-medium transition-colors cursor-pointer"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Rango permitido: de {currentQuestion.min} a {currentQuestion.max}
                  </span>
                </div>
              </form>
            )}

            {/* 2. TIPO CATEGORIA_UNICA */}
            {currentQuestion.tipo === 'categoria_unica' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentQuestion.opciones?.map((opc) => {
                  const isSelected = currentFactValue === opc.valor;
                  return (
                    <button
                      key={String(opc.valor)}
                      type="button"
                      onClick={() => handleSelectOption(opc.valor)}
                      className={`p-4 rounded-2xl border-2 text-left font-medium transition-all flex items-center justify-between group cursor-pointer ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/60 text-indigo-900 shadow-xs'
                          : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50/80 text-slate-800'
                      }`}
                    >
                      <span className="text-base">{opc.etiqueta}</span>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-600 text-white'
                            : 'border-slate-300 group-hover:border-indigo-400'
                        }`}
                      >
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* 3. TIPO ESCALA_1_5 */}
            {currentQuestion.tipo === 'escala_1_5' && (
              <div className="space-y-6">
                <div className="flex flex-col gap-2">
                  <div className="grid grid-cols-5 gap-2 sm:gap-3">
                    {[1, 2, 3, 4, 5].map((num) => {
                      const isSelected = currentFactValue === num;
                      const label1 = currentQuestion.etiquetas?.[1] || 'Poco';
                      const label5 = currentQuestion.etiquetas?.[5] || 'Mucho';

                      return (
                        <button
                          key={num}
                          type="button"
                          onClick={() => handleSelectOption(num)}
                          className={`flex flex-col items-center justify-center py-5 sm:py-6 px-1 rounded-2xl border-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-105'
                              : 'border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 text-slate-800'
                          }`}
                        >
                          <span className="text-2xl sm:text-3xl font-extrabold">{num}</span>
                          {num === 1 && (
                            <span
                              className={`text-[10px] sm:text-[11px] font-medium mt-1 text-center leading-tight line-clamp-2 ${
                                isSelected ? 'text-indigo-100' : 'text-slate-600'
                              }`}
                            >
                              {label1}
                            </span>
                          )}
                          {num === 5 && (
                            <span
                              className={`text-[10px] sm:text-[11px] font-medium mt-1 text-center leading-tight line-clamp-2 ${
                                isSelected ? 'text-indigo-100' : 'text-slate-600'
                              }`}
                            >
                              {label5}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Botón 'Me da igual' (peso 0) */}
                  {currentQuestion.permite_me_da_igual && (
                    <div className="pt-3">
                      <button
                        type="button"
                        onClick={() => handleSelectOption(0)}
                        className={`w-full py-3.5 px-4 rounded-xl border-2 font-medium text-sm transition-all cursor-pointer ${
                          currentFactValue === 0
                            ? 'border-slate-600 bg-slate-700 text-white'
                            : 'border-dashed border-slate-300 text-slate-600 hover:border-slate-400 hover:bg-slate-50'
                        }`}
                      >
                        Me da igual / No me importa (peso 0)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Navigation Controls */}
        <div className="pt-8 border-t border-slate-100 mt-8 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleBack}
            disabled={isFirst}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              isFirst
                ? 'opacity-40 cursor-not-allowed text-slate-400'
                : 'text-slate-700 hover:bg-slate-100 active:bg-slate-200 cursor-pointer'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Atrás</span>
          </button>

          <div className="flex items-center gap-2">
            {(currentQuestion.opcional || currentQuestion.bloque === 'restriccion') && (
              <button
                type="button"
                onClick={handleSkip}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Saltar esta pregunta (no aplicará filtro o peso 0)"
              >
                <span>Saltar</span>
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <span>{isLast ? 'Ver resultados' : 'Siguiente'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
