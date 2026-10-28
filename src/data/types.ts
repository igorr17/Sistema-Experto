/**
 * Tipos de datos para la base de conocimiento y el motor de inferencia.
 */

export type CalidadDato = 'verificado' | 'estimado' | 'SIN DATO';

export interface AtributoInfo {
  valor: number | string;
  fuente: string | null;
  fecha: string | null;
  calidad: CalidadDato;
  obs: string | null;
}

export interface ClimaInfo {
  temperatura: number[];
  precipitacion: number[];
  fuente: string;
  fecha: string;
}

export interface Criterio {
  id: string;
  atributo: string;
  metodo: 'mapa' | 'quintil';
  invertir?: boolean;
  mapa?: Record<string, number>;
}

export interface Pais {
  id: number;
  nombre: string;
  zona: string;
  subzona: string;
  nivel_tramite: number | null;
  atributos: {
    coste_diario: AtributoInfo;
    horas_vuelo: AtributoInfo;
    entrada_espanoles: AtributoInfo;
    seguridad: AtributoInfo;
    sanitarios: AtributoInfo;
    patrimonio_cultural: AtributoInfo;
    naturaleza: AtributoInfo;
    gastronomia: AtributoInfo;
    ingles: AtributoInfo;
    moneda_euro: AtributoInfo;
    playa: AtributoInfo;
    [key: string]: AtributoInfo;
  };
  clima: ClimaInfo | null;
  afinidad: Record<string, number | null>;
}

export interface Condicion {
  izq: string | number | boolean;
  op: '>' | '<' | '>=' | '<=' | '==' | '!=' | 'fuera_de';
  der: string | number | boolean | (number | string)[];
}

export interface Regla {
  id: string;
  tipo: 'filtro' | 'filtro_por_criterio' | 'puntuacion' | 'conflicto' | 'sistema';
  nombre: string;
  si?: Condicion[];
  para_cada?: string[];
  entonces?: {
    accion: 'descartar' | 'puntuar' | 'avisar';
    motivo?: string;
    mensaje?: string;
    explicacion?: string;
  };
  criterios?: string[];
  formula?: string;
  afinidad_sin_dato?: number;
  descripcion?: string;
  fuente?: string;
  umbral_propio?: boolean;
  justificacion?: string;
  esPersonalizada?: boolean;
  activa?: boolean;
}

export interface OpcionPregunta {
  valor: string | number;
  etiqueta: string;
}

export interface Pregunta {
  id: string;
  texto: string;
  tipo: 'numero' | 'categoria_unica' | 'escala_1_5';
  hecho: string;
  bloque: 'restriccion' | 'preferencia';
  min?: number;
  max?: number;
  opciones?: OpcionPregunta[];
  etiquetas?: Record<string, string>;
  permite_me_da_igual?: boolean;
  opcional?: boolean;
  esPersonalizada?: boolean;
  descripcion?: string;
}

export interface KnowledgeBase {
  version: number;
  criterios: Criterio[];
  paises: Pais[];
  reglas: Regla[];
  preguntas: Pregunta[];
}

export interface HechosUsuario {
  presupuesto_diario?: number;
  dias?: number;
  mes?: number;
  horas_max?: number;
  companeros?: 'solo' | 'pareja' | 'ninos' | 'grupo';
  max_tramite?: number;
  acepta_vacunas?: 'Sí' | 'No';
  acepta_riesgo?: 'Sí' | 'No';
  clima?: 'calido' | 'templado' | 'frio' | 'indiferente';
  tolera_lluvia?: 'Sí' | 'No';
  peso_clima?: number;
  peso_playa?: number;
  peso_cultura?: number;
  peso_naturaleza?: number;
  peso_gastronomia?: number;
  peso_precio?: number;
  peso_seguridad?: number;
  peso_ingles?: number;
  [key: string]: string | number | undefined;
}
