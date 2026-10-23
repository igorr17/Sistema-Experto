/**
 * Tipos para el motor de inferencia y resultados de evaluación.
 */
import { AtributoInfo, HechosUsuario, Pais, Regla } from '../data/types';

export interface MotivoDescarte {
  reglaId: string;
  reglaNombre: string;
  motivo: string;
}

export interface DescartePais {
  pais: Pais;
  motivos: MotivoDescarte[];
}

export interface ReglaIncumplidaMargen {
  reglaId: string;
  reglaNombre: string;
  margen: string;
}

export interface AporteCriterio {
  criterioId: string;
  peso: number;
  afinidad: number; // 1-5 (o 3 si SIN DATO)
  esSinDato: boolean;
  puntosAportados: number; // peso * afinidad
  maximoPosible: number; // 5 * peso
  porcentajeAporte: number; // (puntosAportados / maximoPosible) * 100
  atributoClave: string;
  atributoInfo?: AtributoInfo;
}

export interface PaisEvaluado {
  pais: Pais;
  compatibilidad: number | null; // P1 calculada (null si todos los pesos son 0)
  cumpleTodosLosFiltros: boolean; // Cumple F1-F7 y F10
  esAjusteAproximado: boolean; // Rotulado "Los que más se ajustan"
  reglasIncumplidas: ReglaIncumplidaMargen[]; // Lista de reglas con su margen
  desgloseCriterios: AporteCriterio[];
  criteriosAltosCount: number; // afinidad 4 o 5
  reglasSuperadas: string[]; // IDs de reglas evaluadas que no lo descartaron
}

export interface ConflictoDetectado {
  reglaId: string;
  nombre: string;
  mensaje: string;
}

export interface LogReglaDisparada {
  reglaId: string;
  reglaNombre: string;
  paisNombre: string;
  resultado: 'descartado' | 'superado' | 'aviso' | 'ajuste';
  detalle: string;
}

export interface SugerenciaRelajacion {
  reglaId: string;
  reglaNombre: string;
  criterioId?: string;
  conteoDescartes: number;
  sugerenciaTexto: string;
}

export interface ResultadoInferencia {
  paisesMostrados: PaisEvaluado[]; // Países mostrados (nunca pantalla vacía, mínimo 3 si hay disponibles)
  paisesValidos: PaisEvaluado[]; // Alias de paisesMostrados para vistas compatibles
  paisesCumplenTodos: PaisEvaluado[];
  paisesAjusteAproximado: PaisEvaluado[];
  paisesDescartados: DescartePais[];
  todosLosPaisesOriginales: Pais[];
  conflictos: ConflictoDetectado[];
  avisosSistema: string[];
  avisoM1Activo: boolean;
  mensajeM1?: string;
  sugerenciaRelajacion?: SugerenciaRelajacion;
  sinPreferenciasIndicadas: boolean;
  logReglas: LogReglaDisparada[];
  preguntasRestriccionSinResponder: string[];
}
