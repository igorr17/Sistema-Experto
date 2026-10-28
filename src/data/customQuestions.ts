/**
 * Módulo de persistencia y gestión de preguntas personalizadas añadidas por el cliente.
 * Se guardan en localStorage para persistencia y se inyectan en la Base de Conocimiento (kb.preguntas).
 */
import { Pregunta } from './types';

const STORAGE_KEY = 'akinator_viajes_preguntas_personalizadas';

export function obtenerPreguntasPersonalizadas(): Pregunta[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (e) {
    console.error('Error cargando preguntas personalizadas de localStorage:', e);
  }
  return [];
}

export function guardarPreguntasPersonalizadas(preguntas: Pregunta[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preguntas));
  } catch (e) {
    console.error('Error guardando preguntas personalizadas en localStorage:', e);
  }
}

export function agregarPreguntaPersonalizada(nuevaPregunta: Pregunta): Pregunta[] {
  const actuales = obtenerPreguntasPersonalizadas();
  const index = actuales.findIndex((q) => q.id === nuevaPregunta.id);
  let actualizadas: Pregunta[];
  if (index >= 0) {
    actualizadas = [...actuales];
    actualizadas[index] = nuevaPregunta;
  } else {
    actualizadas = [...actuales, nuevaPregunta];
  }
  guardarPreguntasPersonalizadas(actualizadas);
  return actualizadas;
}

export function eliminarPreguntaPersonalizada(preguntaId: string): Pregunta[] {
  const actuales = obtenerPreguntasPersonalizadas();
  const actualizadas = actuales.filter((q) => q.id !== preguntaId);
  guardarPreguntasPersonalizadas(actualizadas);
  return actualizadas;
}
