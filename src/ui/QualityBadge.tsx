import React from 'react';
import { CalidadDato } from '../data/types';
import { ExternalLink, Info, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

interface QualityBadgeProps {
  calidad?: CalidadDato | string;
  fuente?: string | null;
  fecha?: string | null;
  obs?: string | null;
  showDetails?: boolean;
}

export const QualityBadge: React.FC<QualityBadgeProps> = ({
  calidad = 'estimado',
  fuente,
  fecha,
  obs,
  showDetails = true,
}) => {
  const getBadgeStyle = () => {
    switch (calidad) {
      case 'verificado':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'estimado':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'SIN DATO':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const getIcon = () => {
    switch (calidad) {
      case 'verificado':
        return <CheckCircle2 className="w-3.5 h-3.5" />;
      case 'estimado':
        return <Info className="w-3.5 h-3.5" />;
      case 'SIN DATO':
        return <HelpCircle className="w-3.5 h-3.5" />;
      default:
        return <AlertCircle className="w-3.5 h-3.5" />;
    }
  };

  const isHttp = fuente && (fuente.startsWith('http://') || fuente.startsWith('https://'));

  return (
    <div className="inline-flex flex-col gap-1 text-xs">
      <div className="inline-flex items-center gap-1.5">
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-medium uppercase tracking-wider ${getBadgeStyle()}`}
          title={`Calidad del dato: ${calidad}`}
        >
          {getIcon()}
          <span>{calidad}</span>
        </span>

        {fecha && (
          <span className="text-[11px] text-slate-600" title="Fecha de consulta">
            ({fecha})
          </span>
        )}
      </div>

      {showDetails && fuente && (
        <div className="text-[11px] text-slate-500 mt-0.5">
          {isHttp ? (
            <a
              href={fuente}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 hover:underline break-all"
            >
              <span>Fuente oficial</span>
              <ExternalLink className="w-3 h-3 inline flex-shrink-0" />
            </a>
          ) : (
            <span className="italic text-slate-500">{fuente}</span>
          )}
          {obs && <p className="text-[10px] text-slate-400 mt-0.5">{obs}</p>}
        </div>
      )}
    </div>
  );
};
