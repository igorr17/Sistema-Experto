import React, { useState } from 'react';
import { Condicion, Regla } from '../data/types';
import { X, Plus, Trash2, CheckCircle2, ShieldAlert, Sparkles, HelpCircle } from 'lucide-react';

interface AddRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRule: (regla: Regla) => void;
  totalReglasExistentes: number;
}

const OPCIONES_CAMPO = [
  // Atributos de país
  { valor: 'pais.coste_diario', etiqueta: 'País: Coste diario estimado (€/día)', tipo: 'numero' },
  { valor: 'pais.horas_vuelo', etiqueta: 'País: Horas de vuelo directo desde Madrid', tipo: 'numero' },
  { valor: 'pais.seguridad', etiqueta: 'País: Nivel de seguridad (Bajo riesgo, Riesgo medio, Riesgo alto)', tipo: 'texto' },
  { valor: 'pais.entrada_espanoles', etiqueta: 'País: Trámite de entrada (DNI, Pasaporte sin visado, etc.)', tipo: 'texto' },
  { valor: 'pais.sanitarios', etiqueta: 'País: Vacunas recomendadas o profilaxis', tipo: 'texto' },
  { valor: 'pais.playa', etiqueta: 'País: ¿Tiene destino de playa? (Sí / No)', tipo: 'texto' },
  { valor: 'pais.patrimonio_cultural', etiqueta: 'País: Sitios de patrimonio cultural UNESCO', tipo: 'numero' },
  { valor: 'pais.naturaleza', etiqueta: 'País: Sitios naturales UNESCO', tipo: 'numero' },
  { valor: 'pais.gastronomia', etiqueta: 'País: Ciudades creativas de gastronomía UNESCO', tipo: 'numero' },
  { valor: 'pais.ingles', etiqueta: 'País: Nivel de inglés (1 a 5)', tipo: 'numero' },
  { valor: 'pais.moneda_euro', etiqueta: 'País: Moneda Euro (Sí / No)', tipo: 'texto' },

  // Hechos del usuario
  { valor: 'hecho.presupuesto_diario', etiqueta: 'Usuario: Presupuesto diario máximo (€/día)', tipo: 'numero' },
  { valor: 'hecho.horas_max', etiqueta: 'Usuario: Horas máximas de vuelo', tipo: 'numero' },
  { valor: 'hecho.dias', etiqueta: 'Usuario: Días de viaje', tipo: 'numero' },
  { valor: 'hecho.companeros', etiqueta: 'Usuario: Compañeros (solo, pareja, ninos, grupo)', tipo: 'texto' },
  { valor: 'hecho.clima', etiqueta: 'Usuario: Clima preferido (calido, templado, frio, indiferente)', tipo: 'texto' },
  { valor: 'hecho.tolera_lluvia', etiqueta: 'Usuario: ¿Tolera lluvia? (Sí / No)', tipo: 'texto' },
  { valor: 'hecho.acepta_riesgo', etiqueta: 'Usuario: ¿Acepta riesgo? (Sí / No)', tipo: 'texto' },
  { valor: 'hecho.acepta_vacunas', etiqueta: 'Usuario: ¿Acepta vacunas? (Sí / No)', tipo: 'texto' },
  { valor: 'hecho.max_tramite', etiqueta: 'Usuario: Nivel máximo de trámite (0, 1, 2, 3)', tipo: 'numero' },
];

export const AddRuleModal: React.FC<AddRuleModalProps> = ({
  isOpen,
  onClose,
  onAddRule,
  totalReglasExistentes,
}) => {
  const [nombre, setNombre] = useState('');
  const [reglaId, setReglaId] = useState(`R_CLIENTE_${totalReglasExistentes + 1}`);
  const [tipo, setTipo] = useState<'filtro' | 'conflicto'>('filtro');
  const [motivo, setMotivo] = useState('');
  const [condiciones, setCondiciones] = useState<Condicion[]>([
    { izq: 'pais.coste_diario', op: '>', der: 'hecho.presupuesto_diario' },
  ]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddCondicion = () => {
    setCondiciones((prev) => [
      ...prev,
      { izq: 'pais.horas_vuelo', op: '>', der: 'hecho.horas_max' },
    ]);
  };

  const handleRemoveCondicion = (idx: number) => {
    if (condiciones.length <= 1) return;
    setCondiciones((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateCondicion = (idx: number, campo: keyof Condicion, valor: any) => {
    setCondiciones((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [campo]: valor };
      return copy;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!nombre.trim()) {
      setErrorMsg('Por favor ingresa un nombre descriptivo para la regla.');
      return;
    }
    if (!reglaId.trim()) {
      setErrorMsg('Por favor ingresa un identificador único (ID) para la regla.');
      return;
    }
    if (!motivo.trim()) {
      setErrorMsg(
        tipo === 'filtro'
          ? 'Ingresa el motivo de descarte cuando la regla se active.'
          : 'Ingresa el mensaje de alerta o advertencia al usuario.'
      );
      return;
    }
    if (condiciones.length === 0) {
      setErrorMsg('La regla debe tener al menos una condición SI...');
      return;
    }

    // Normalizar tipos en condiciones si son números literales
    const condicionesNormalizadas = condiciones.map((c) => {
      let derValor: any = c.der;
      if (typeof derValor === 'string' && !derValor.startsWith('hecho.') && !derValor.startsWith('pais.')) {
        if (!isNaN(Number(derValor)) && derValor.trim() !== '') {
          derValor = Number(derValor);
        }
      }
      return {
        ...c,
        der: derValor,
      };
    });

    const nuevaRegla: Regla = {
      id: reglaId.trim().toUpperCase(),
      tipo,
      nombre: nombre.trim(),
      si: condicionesNormalizadas,
      entonces: {
        accion: tipo === 'filtro' ? 'descartar' : 'avisar',
        motivo: tipo === 'filtro' ? motivo.trim() : undefined,
        mensaje: tipo === 'conflicto' ? motivo.trim() : undefined,
      },
      descripcion: `Regla personalizada añadida por el cliente: ${nombre.trim()}`,
      esPersonalizada: true,
      activa: true,
    };

    onAddRule(nuevaRegla);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Añadir Nueva Regla al Sistema Experto</h3>
              <p className="text-xs text-slate-500">
                Define una regla de inferencia personalizada que se integrará en la Base de Conocimiento
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-semibold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Nombre e ID */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Nombre de la regla *
              </label>
              <input
                type="text"
                placeholder="Ej: Excluir destinos sin playa si viajan niños"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none text-xs text-slate-900 bg-white"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                ID de la regla *
              </label>
              <input
                type="text"
                value={reglaId}
                onChange={(e) => setReglaId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none text-xs text-slate-900 bg-white font-mono uppercase"
                required
              />
            </div>
          </div>

          {/* Tipo de regla */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">
              Tipo de regla del Sistema Experto *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setTipo('filtro');
                  if (!motivo) setMotivo('No cumple la condición personalizada.');
                }}
                className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                  tipo === 'filtro'
                    ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-100'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5 mb-0.5">
                  <span>🛡️ Filtro Restrictivo</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Descarta el país si se cumple la condición eliminatoria especificada.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTipo('conflicto');
                  if (!motivo) setMotivo('Aviso: tus selecciones presentan inconsistencias.');
                }}
                className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                  tipo === 'conflicto'
                    ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-100'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5 mb-0.5">
                  <span>⚠️ Conflicto o Advertencia</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Emite un aviso o advertencia cuando los hechos del usuario colisionan.
                </p>
              </button>
            </div>
          </div>

          {/* Constructor de Condiciones SI... */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <span>Condiciones (SI... / Premisas)</span>
              </label>
              <button
                type="button"
                onClick={handleAddCondicion}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Añadir condición (Y)</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {condiciones.map((cond, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 sm:space-y-0 sm:flex sm:items-center sm:gap-2 text-xs"
                >
                  <span className="font-bold text-slate-500 text-[11px] px-1">
                    {idx === 0 ? 'SI' : 'Y'}
                  </span>

                  {/* Operando Izquierdo */}
                  <select
                    value={String(cond.izq)}
                    onChange={(e) => handleUpdateCondicion(idx, 'izq', e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium text-slate-800 outline-none focus:border-indigo-600"
                  >
                    {OPCIONES_CAMPO.map((opt) => (
                      <option key={opt.valor} value={opt.valor}>
                        {opt.etiqueta}
                      </option>
                    ))}
                  </select>

                  {/* Operador */}
                  <select
                    value={cond.op}
                    onChange={(e) => handleUpdateCondicion(idx, 'op', e.target.value)}
                    className="w-20 px-2 py-2 rounded-xl border border-slate-300 bg-white font-bold text-center text-slate-900 outline-none focus:border-indigo-600"
                  >
                    <option value=">">&gt; (mayor que)</option>
                    <option value="<">&lt; (menor que)</option>
                    <option value=">=">&gt;= (mayor o igual)</option>
                    <option value="<=">&lt;= (menor o igual)</option>
                    <option value="==">== (igual a)</option>
                    <option value="!=">!= (distinto de)</option>
                  </select>

                  {/* Operando Derecho */}
                  <div className="flex-1 flex gap-1">
                    <input
                      type="text"
                      placeholder="Valor o hecho (ej: hecho.horas_max, 50, Sí...)"
                      value={String(cond.der)}
                      onChange={(e) => handleUpdateCondicion(idx, 'der', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium text-slate-800 outline-none focus:border-indigo-600"
                    />
                  </div>

                  {condiciones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCondicion(idx)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer self-end sm:self-center"
                      title="Eliminar condición"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 italic">
              Puedes comparar un atributo de país contra un hecho del usuario (ej: <code>pais.coste_diario &gt; hecho.presupuesto_diario</code>) o contra un valor literal fijo (ej: <code>50</code>, <code>"Sí"</code>, <code>"Riesgo alto"</code>).
            </p>
          </div>

          {/* Consecuente ENTONCES... */}
          <div className="space-y-1 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Consecuencia (ENTONCES... / Motivo o Mensaje) *
            </label>
            <input
              type="text"
              placeholder={
                tipo === 'filtro'
                  ? 'Ej: El coste o vuelo supera las condiciones establecidas por el usuario.'
                  : 'Ej: Has indicado presupuesto muy bajo para vuelos intercontinentales.'
              }
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none text-xs text-slate-900 bg-white"
              required
            />
            <p className="text-[11px] text-slate-400">
              Este texto se mostrará en el log y trazabilidad de inferencia cuando la regla se ejecute.
            </p>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Guardar e incorporar al Motor</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
