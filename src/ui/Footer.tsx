import React from 'react';
import { TEXTO_LIMITACIONES } from '../explain/explainer';
import { ShieldAlert, BookOpen, Database } from 'lucide-react';

interface FooterProps {
  version: number;
}

export const Footer: React.FC<FooterProps> = ({ version }) => {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 text-slate-600 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col gap-4">
        {/* Banner de limitaciones obligatorio */}
        <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3">
          <ShieldAlert className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
          <div className="text-amber-900 leading-relaxed">
            <strong className="font-semibold block mb-0.5">Aviso sobre los datos y limitaciones:</strong>
            <p>{TEXTO_LIMITACIONES}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 pt-2 border-t border-slate-200">
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-indigo-500" />
            <span>
              Base de conocimiento: <strong>knowledge.json (v{version})</strong>
            </span>
            <span className="text-slate-300">•</span>
            <span>40 países analizados</span>
          </div>

          <div className="text-center sm:text-right">
            <span>Akinator de Viajes — Sistema Experto Determinista en Navegador</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
