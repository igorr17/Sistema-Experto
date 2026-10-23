/**
 * Módulo de explicación para el sistema experto.
 * Genera explicaciones detalladas para destinos recomendados y descartados.
 */
import { AtributoInfo, CalidadDato, Pais } from '../data/types';
import { AporteCriterio, PaisEvaluado, ReglaIncumplidaMargen } from '../engine/types';

export interface ExplicacionCriterio {
  id: string;
  nombreCriterio: string;
  peso: number;
  afinidad: number;
  esSinDato: boolean;
  puntosAportados: number;
  maximoPosible: number;
  porcentaje: number;
  datoRealFormateado: string;
  atributoClave: string;
  calidad: CalidadDato;
  fuente: string | null;
  fecha: string | null;
  observaciones: string | null;
}

export interface ExplicacionCompletaPais {
  pais: Pais;
  compatibilidad: number | null;
  cumpleTodasRestricciones: boolean;
  esAjusteAproximado: boolean;
  reglasIncumplidas: ReglaIncumplidaMargen[];
  ranking: number;
  criterios: ExplicacionCriterio[];
  reglasSuperadas: string[];
  atributosPrincipales: {
    clave: string;
    etiqueta: string;
    valorFormateado: string;
    calidad: CalidadDato;
    fuente: string | null;
    fecha: string | null;
  }[];
}

const NOMBRES_CRITERIOS: Record<string, string> = {
  playa: 'Playa y costa',
  cultura: 'Patrimonio y cultura',
  naturaleza: 'Naturaleza y paisajes',
  gastronomia: 'Gastronomía local',
  precio: 'Económico / Presupuesto',
  seguridad: 'Seguridad ciudadana',
  ingles: 'Nivel de inglés',
  clima: 'Clima y temperatura',
};

export function formatearAtributoConUnidad(clave: string, info?: AtributoInfo): string {
  if (!info || info.valor === 'SIN DATO' || info.calidad === 'SIN DATO') {
    return 'Dato no disponible';
  }

  const v = info.valor;

  switch (clave) {
    case 'coste_diario':
      return `${v} €/día`;
    case 'horas_vuelo':
      return `${v} horas de vuelo`;
    case 'patrimonio_cultural':
      return `${v} sitios UNESCO de patrimonio`;
    case 'naturaleza':
      return `${v} sitios UNESCO naturales`;
    case 'gastronomia':
      return `${v} ciudades creativas de gastronomía (UNESCO)`;
    case 'seguridad':
      return String(v);
    case 'ingles':
      return `Nivel ${v}`;
    case 'entrada_espanoles':
      return String(v);
    case 'sanitarios':
      return String(v);
    case 'moneda_euro':
      return v === 'Sí' ? 'Usa Euro (€)' : 'Moneda local distinta del Euro';
    case 'playa':
      return v === 'Sí' ? 'Costa con playas turísticas destacadas' : 'Sin oferta playera principal';
    default:
      return String(v);
  }
}

export function explicarPais(paisEvaluado: PaisEvaluado, ranking: number): ExplicacionCompletaPais {
  const { pais, compatibilidad, desgloseCriterios, reglasSuperadas } = paisEvaluado;

  const criterios: ExplicacionCriterio[] = desgloseCriterios.map((c: AporteCriterio) => {
    const info = c.atributoInfo;
    const nombreCriterio = NOMBRES_CRITERIOS[c.criterioId] || c.criterioId;

    return {
      id: c.criterioId,
      nombreCriterio,
      peso: c.peso,
      afinidad: c.afinidad,
      esSinDato: c.esSinDato,
      puntosAportados: c.puntosAportados,
      maximoPosible: c.maximoPosible,
      porcentaje: c.porcentajeAporte,
      datoRealFormateado: formatearAtributoConUnidad(c.atributoClave, info),
      atributoClave: c.atributoClave,
      calidad: info?.calidad || (c.esSinDato ? 'SIN DATO' : 'estimado'),
      fuente: info?.fuente || null,
      fecha: info?.fecha || null,
      observaciones: info?.obs || null,
    };
  });

  const atributosPrincipales = [
    {
      clave: 'coste_diario',
      etiqueta: 'Coste diario estimado',
      valorFormateado: formatearAtributoConUnidad('coste_diario', pais.atributos.coste_diario),
      calidad: pais.atributos.coste_diario?.calidad,
      fuente: pais.atributos.coste_diario?.fuente,
      fecha: pais.atributos.coste_diario?.fecha,
    },
    {
      clave: 'horas_vuelo',
      etiqueta: 'Tiempo de vuelo desde Madrid',
      valorFormateado: formatearAtributoConUnidad('horas_vuelo', pais.atributos.horas_vuelo),
      calidad: pais.atributos.horas_vuelo?.calidad,
      fuente: pais.atributos.horas_vuelo?.fuente,
      fecha: pais.atributos.horas_vuelo?.fecha,
    },
    {
      clave: 'entrada_espanoles',
      etiqueta: 'Requisitos de entrada',
      valorFormateado: formatearAtributoConUnidad('entrada_espanoles', pais.atributos.entrada_espanoles),
      calidad: pais.atributos.entrada_espanoles?.calidad,
      fuente: pais.atributos.entrada_espanoles?.fuente,
      fecha: pais.atributos.entrada_espanoles?.fecha,
    },
    {
      clave: 'seguridad',
      etiqueta: 'Nivel de seguridad (GPI)',
      valorFormateado: formatearAtributoConUnidad('seguridad', pais.atributos.seguridad),
      calidad: pais.atributos.seguridad?.calidad,
      fuente: pais.atributos.seguridad?.fuente,
      fecha: pais.atributos.seguridad?.fecha,
    },
    {
      clave: 'sanitarios',
      etiqueta: 'Requisitos sanitarios / vacunas',
      valorFormateado: formatearAtributoConUnidad('sanitarios', pais.atributos.sanitarios),
      calidad: pais.atributos.sanitarios?.calidad,
      fuente: pais.atributos.sanitarios?.fuente,
      fecha: pais.atributos.sanitarios?.fecha,
    },
  ];

  return {
    pais,
    compatibilidad,
    cumpleTodasRestricciones: paisEvaluado.cumpleTodosLosFiltros,
    esAjusteAproximado: paisEvaluado.esAjusteAproximado,
    reglasIncumplidas: paisEvaluado.reglasIncumplidas,
    ranking,
    criterios,
    reglasSuperadas,
    atributosPrincipales,
  };
}

export const TEXTO_LIMITACIONES =
  'Datos consultados el 2026-10-19. Los requisitos de entrada y sanitarios pueden cambiar. Seguridad = Global Peace Index (umbral propio). Naturaleza y gastronomía = reconocimientos UNESCO, no miden toda la oferta.';
