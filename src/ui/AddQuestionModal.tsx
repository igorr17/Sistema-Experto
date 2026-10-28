import React, { useState } from 'react';
import { Pregunta, OpcionPregunta } from '../data/types';
import {
  X,
  Plus,
  Trash2,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Layers,
  Dog,
  HeartHandshake,
  Utensils,
  Wifi,
} from 'lucide-react';

interface AddQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddQuestion: (pregunta: Pregunta) => void;
  totalPreguntasExistentes: number;
}

const PLANTILLAS_PREDEFINIDAS = [
  {
    titulo: 'Viajar con mascotas',
    icono: '🐾',
    texto: '¿Viajas con mascotas o animales de compañía?',
    hecho: 'viaja_con_mascotas',
    bloque: 'restriccion' as const,
    tipo: 'categoria_unica' as const,
    opciones: [
      { valor: 'Sí', etiqueta: 'Sí, viajo con mi mascota (requiere alojamiento y trámites pet-friendly)' },
      { valor: 'No', etiqueta: 'No, viajo sin mascotas' },
    ],
  },
  {
    titulo: 'Accesibilidad reducida',
    icono: '♿',
    texto: '¿Requieres infraestructura adaptada para movilidad reducida o silla de ruedas?',
    hecho: 'accesibilidad_reducida',
    bloque: 'restriccion' as const,
    tipo: 'categoria_unica' as const,
    opciones: [
      { valor: 'Sí', etiqueta: 'Sí, requiero accesibilidad universal y transporte adaptado' },
      { valor: 'No', etiqueta: 'No requiero adaptaciones específicas' },
    ],
  },
  {
    titulo: 'Teletrabajo / Nómada digital',
    icono: '💻',
    texto: '¿Planeas teletrabajar durante la estancia y necesitas conexión de alta velocidad?',
    hecho: 'requiere_teletrabajo',
    bloque: 'preferencia' as const,
    tipo: 'categoria_unica' as const,
    opciones: [
      { valor: 'Sí', etiqueta: 'Sí, imprescindible buena infraestructura digital' },
      { valor: 'No', etiqueta: 'No, desconexión total' },
    ],
  },
  {
    titulo: 'Preferencia de vida nocturna',
    icono: '🎉',
    texto: '¿Qué importancia le das al ocio nocturno y ambiente de fiesta en el destino?',
    hecho: 'peso_vida_nocturna',
    bloque: 'preferencia' as const,
    tipo: 'escala_1_5' as const,
    opciones: [],
  },
];

export const AddQuestionModal: React.FC<AddQuestionModalProps> = ({
  isOpen,
  onClose,
  onAddQuestion,
  totalPreguntasExistentes,
}) => {
  const [texto, setTexto] = useState('');
  const [preguntaId, setPreguntaId] = useState(`Q_CUSTOM_${totalPreguntasExistentes + 1}`);
  const [hecho, setHecho] = useState('');
  const [bloque, setBloque] = useState<'restriccion' | 'preferencia'>('restriccion');
  const [tipo, setTipo] = useState<'categoria_unica' | 'escala_1_5' | 'numero'>('categoria_unica');
  const [permiteMeDaIgual, setPermiteMeDaIgual] = useState<boolean>(true);

  // Opciones para tipo categoria_unica
  const [opciones, setOpciones] = useState<OpcionPregunta[]>([
    { valor: 'Sí', etiqueta: 'Sí' },
    { valor: 'No', etiqueta: 'No' },
  ]);

  // Rangos para tipo número
  const [numMin, setNumMin] = useState<number>(0);
  const [numMax, setNumMax] = useState<number>(100);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Generador automático de clave de hecho a partir del texto
  const handleTextoChange = (nuevoTexto: string) => {
    setTexto(nuevoTexto);
    if (!hecho || hecho.startsWith('pregunta_') || hecho.startsWith('custom_')) {
      const slug = nuevoTexto
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .slice(0, 30);
      if (slug) {
        setHecho(slug);
      }
    }
  };

  const handleApplyTemplate = (tpl: typeof PLANTILLAS_PREDEFINIDAS[0]) => {
    setTexto(tpl.texto);
    setHecho(tpl.hecho);
    setBloque(tpl.bloque);
    setTipo(tpl.tipo);
    setPreguntaId(`Q_${tpl.hecho.toUpperCase()}`);
    if (tpl.tipo === 'categoria_unica') {
      setOpciones(tpl.opciones);
    }
    setErrorMsg(null);
  };

  const handleAddOption = () => {
    const nextVal = `Opción ${opciones.length + 1}`;
    setOpciones((prev) => [...prev, { valor: nextVal, etiqueta: nextVal }]);
  };

  const handleRemoveOption = (index: number) => {
    if (opciones.length <= 1) return;
    setOpciones((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateOption = (index: number, field: 'valor' | 'etiqueta', val: string) => {
    setOpciones((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      if (field === 'etiqueta' && copy[index].valor === copy[index].etiqueta) {
        copy[index].valor = val;
      }
      return copy;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!texto.trim()) {
      setErrorMsg('Por favor escribe el texto de la pregunta.');
      return;
    }
    if (!preguntaId.trim()) {
      setErrorMsg('Por favor ingresa un identificador único (ID) para la pregunta.');
      return;
    }
    const cleanHecho = hecho.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
    if (!cleanHecho) {
      setErrorMsg('Por favor define la clave del hecho en hechosUsuario (ej: viaja_mascotas).');
      return;
    }

    if (tipo === 'categoria_unica' && opciones.length < 2) {
      setErrorMsg('Una pregunta de opciones debe tener al menos dos opciones (ej: Sí y No).');
      return;
    }

    const nuevaPregunta: Pregunta = {
      id: preguntaId.trim().toUpperCase(),
      texto: texto.trim(),
      tipo,
      hecho: cleanHecho,
      bloque,
      permite_me_da_igual: permiteMeDaIgual,
      opcional: true,
      esPersonalizada: true,
      descripcion: `Pregunta añadida por el usuario: ${texto.trim()}`,
      opciones: tipo === 'categoria_unica' ? opciones : undefined,
      min: tipo === 'numero' ? numMin : undefined,
      max: tipo === 'numero' ? numMax : undefined,
      etiquetas:
        tipo === 'escala_1_5'
          ? {
              '1': 'Nada importante',
              '2': 'Poco importante',
              '3': 'Importancia media',
              '4': 'Bastante importante',
              '5': 'Imprescindible',
            }
          : undefined,
    };

    onAddQuestion(nuevaPregunta);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-sm">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Añadir Nueva Pregunta al Cuestionario</h3>
              <p className="text-xs text-slate-500">
                Incorpora preguntas adicionales (ej: viajar con mascotas, accesibilidad, etc.)
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

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-semibold flex items-center gap-2">
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Plantillas Rápidas sugeridas */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Sugerencias rápidas (haz clic para autocompletar):
            </span>
            <div className="flex flex-wrap gap-2">
              {PLANTILLAS_PREDEFINIDAS.map((tpl) => (
                <button
                  key={tpl.titulo}
                  type="button"
                  onClick={() => handleApplyTemplate(tpl)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 text-slate-700 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{tpl.icono}</span>
                  <span>{tpl.titulo}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Pregunta y Bloque */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Texto de la pregunta *
              </label>
              <input
                type="text"
                placeholder="Ej: ¿Viajas con mascotas o animales de compañía?"
                value={texto}
                onChange={(e) => handleTextoChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none text-xs text-slate-900 bg-white"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Identificador (ID) *
                </label>
                <input
                  type="text"
                  value={preguntaId}
                  onChange={(e) => setPreguntaId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none text-xs text-slate-900 bg-white font-mono uppercase"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Clave del hecho (`hecho`) *
                </label>
                <input
                  type="text"
                  placeholder="ej: viaja_con_mascotas"
                  value={hecho}
                  onChange={(e) => setHecho(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none text-xs text-slate-900 bg-white font-mono lowercase"
                  required
                />
              </div>
            </div>
          </div>

          {/* Bloque (Restricción vs Preferencia) */}
          <div className="space-y-1 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700 block">
              Categoría de la pregunta *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setBloque('restriccion')}
                className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                  bloque === 'restriccion'
                    ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-100'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="font-bold text-xs text-slate-900 mb-0.5">
                  🛡️ Restricción / Requisito
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Condición indispensable de viaje (ej: mascotas, presupuesto, visa).
                </p>
              </button>

              <button
                type="button"
                onClick={() => setBloque('preferencia')}
                className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                  bloque === 'preferencia'
                    ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-100'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="font-bold text-xs text-slate-900 mb-0.5">
                  ⭐ Preferencia o Gusto
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Prioridad que suma afinidad porcentual a los destinos.
                </p>
              </button>
            </div>
          </div>

          {/* Tipo de Pregunta */}
          <div className="space-y-1 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700 block">
              Tipo de respuesta esperada *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTipo('categoria_unica')}
                className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                  tipo === 'categoria_unica'
                    ? 'border-indigo-600 bg-indigo-600 text-white font-bold'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50 font-medium'
                }`}
              >
                <span className="text-xs block">Opciones (Sí / No)</span>
              </button>
              <button
                type="button"
                onClick={() => setTipo('escala_1_5')}
                className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                  tipo === 'escala_1_5'
                    ? 'border-indigo-600 bg-indigo-600 text-white font-bold'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50 font-medium'
                }`}
              >
                <span className="text-xs block">Escala 1 a 5</span>
              </button>
              <button
                type="button"
                onClick={() => setTipo('numero')}
                className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                  tipo === 'numero'
                    ? 'border-indigo-600 bg-indigo-600 text-white font-bold'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50 font-medium'
                }`}
              >
                <span className="text-xs block">Numérica</span>
              </button>
            </div>
          </div>

          {/* Opciones si es categoria_unica */}
          {tipo === 'categoria_unica' && (
            <div className="space-y-2 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  Opciones seleccionables para el viajero:
                </span>
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir opción</span>
                </button>
              </div>

              <div className="space-y-2">
                {opciones.map((opc, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={opc.etiqueta}
                      onChange={(e) => handleUpdateOption(idx, 'etiqueta', e.target.value)}
                      placeholder={`Opción ${idx + 1}`}
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-800 outline-none focus:border-indigo-600"
                    />
                    {opciones.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(idx)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title="Eliminar opción"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rango si es número */}
          {tipo === 'numero' && (
            <div className="grid grid-cols-2 gap-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Mínimo</label>
                <input
                  type="number"
                  value={numMin}
                  onChange={(e) => setNumMin(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-800"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Máximo</label>
                <input
                  type="number"
                  value={numMax}
                  onChange={(e) => setNumMax(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-800"
                />
              </div>
            </div>
          )}

          {/* Permite Me Da Igual */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="permite_me_da_igual"
              checked={permiteMeDaIgual}
              onChange={(e) => setPermiteMeDaIgual(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
            />
            <label htmlFor="permite_me_da_igual" className="text-xs text-slate-700 font-medium cursor-pointer">
              Permitir botón &ldquo;Me da igual / Omitir&rdquo; para esta pregunta
            </label>
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
              <span>Guardar pregunta en Cuestionario</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
