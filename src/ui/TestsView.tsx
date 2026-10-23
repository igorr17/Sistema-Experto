import React, { useState, useEffect } from 'react';
import { KnowledgeBase } from '../data/types';
import { runTests, TestReport } from '../engine/tests';
import { CheckCircle2, XCircle, RotateCcw, ArrowLeft, ShieldCheck, Clock } from 'lucide-react';

interface TestsViewProps {
  kb: KnowledgeBase;
  onBack: () => void;
}

export const TestsView: React.FC<TestsViewProps> = ({ kb, onBack }) => {
  const [report, setReport] = useState<TestReport | null>(null);

  const executeTests = () => {
    const res = runTests(kb);
    setReport(res);
  };

  useEffect(() => {
    executeTests();
  }, [kb]);

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Suite de Pruebas de Calidad</span>
            </span>
            {report && (
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {report.tiempoMs} ms
              </span>
            )}
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Validación de Casos de Prueba (15 casos)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Ejecución determinista de los 15 escenarios de prueba exigidos sobre knowledge.json.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={executeTests}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Volver a ejecutar</span>
          </button>
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a la App</span>
          </button>
        </div>
      </div>

      {/* Summary Scoreboard */}
      {report && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-medium block">Total pruebas</span>
              <strong className="text-2xl font-black text-slate-900">{report.total}</strong>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-bold">
              15
            </div>
          </div>

          <div className="bg-emerald-50/70 p-5 rounded-2xl border border-emerald-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-emerald-700 font-medium block">Superadas</span>
              <strong className="text-2xl font-black text-emerald-700">{report.pasadas}</strong>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
              ✓
            </div>
          </div>

          <div
            className={`p-5 rounded-2xl border shadow-xs flex items-center justify-between ${
              report.fallidas === 0
                ? 'bg-slate-50 border-slate-200 text-slate-500'
                : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}
          >
            <div>
              <span className="text-xs font-medium block">Fallidas</span>
              <strong className="text-2xl font-black">{report.fallidas}</strong>
            </div>
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                report.fallidas === 0 ? 'bg-slate-200 text-slate-600' : 'bg-rose-600 text-white'
              }`}
            >
              {report.fallidas}
            </div>
          </div>
        </div>
      )}

      {/* Test cases list */}
      {report && (
        <div className="space-y-3">
          {report.resultados.map((t) => {
            const isPass = t.status === 'pass';
            return (
              <div
                key={t.id}
                className={`p-5 rounded-2xl border transition-all bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs ${
                  isPass ? 'border-slate-200 hover:border-emerald-300' : 'border-rose-300 bg-rose-50/40'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {isPass ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold font-mono text-slate-400">
                        Caso #{t.id}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{t.nombre}</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{t.mensaje}</p>
                  </div>
                </div>

                <div className="self-end sm:self-center">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                      isPass
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}
                  >
                    {isPass ? 'PASS' : 'FAIL'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
